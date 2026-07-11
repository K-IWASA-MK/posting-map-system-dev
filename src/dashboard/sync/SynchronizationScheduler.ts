import { HAppConnectionState } from '../HAppConnectionState';
import { RetryController } from './RetryController';

/**
 * SynchronizationScheduler.ts
 * 
 * ダッシュボード全体のデータ同期スケジュール・ループ制御を行う。
 * 定期同期、手動の即時同期、通信失敗時の指数バックオフリトライ、および
 * ブラウザオフライン時の自発的一時停止（Offline Policy）を制御し、
 * 仕様で定義された同期イベント（sync-start, sync-success, sync-failed 等）を配信する。
 */

export type SchedulerEvent =
  | 'sync-start'
  | 'sync-success'
  | 'sync-failed'
  | 'sync-skipped'
  | 'sync-offline'
  | 'sync-retry';

export type SchedulerListener = (event: SchedulerEvent, details?: any) => void;

export class SynchronizationScheduler {
  private readonly connectionState: HAppConnectionState;
  private readonly retryController: RetryController;

  private syncTimer: any = null;
  private isSyncing = false;
  private listeners: SchedulerListener[] = [];

  // 同期メトリクス
  private lastSyncTime = 0;
  private lastSyncDuration = 0;
  private lastRetryCount = 0;

  private totalSyncCount = 0;
  private totalSyncDuration = 0;
  private maxSyncTime = 0;
  private totalRetryCount = 0;

  private totalOfflineDuration = 0;
  private offlineStartTime = 0;

  constructor(connectionState: HAppConnectionState, retryController = new RetryController()) {
    this.connectionState = connectionState;
    this.retryController = retryController;
  }

  /**
   * スケジューラの状態変化（同期イベント）を購読する
   */
  subscribe(listener: SchedulerListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * オンライン復帰時のオフライン期間集計
   */
  private handleOnlineDetected(): void {
    if (this.offlineStartTime > 0) {
      this.totalOfflineDuration += Date.now() - this.offlineStartTime;
      this.offlineStartTime = 0;
    }
  }

  /**
   * イベントを発行し、リスナーおよび接続状態を更新する
   */
  private emit(event: SchedulerEvent, details?: any): void {
    console.log(`[SynchronizationScheduler] Event emitted: ${event}`, details || '');
    
    // オフライン・オンライン監視とオフライン継続時間の集計
    if (event === 'sync-offline') {
      if (this.offlineStartTime === 0) {
        this.offlineStartTime = Date.now();
      }
    } else {
      this.handleOnlineDetected();
    }

    // HAppConnectionState への状態バインド
    if (event === 'sync-offline') {
      this.connectionState.setState('OFFLINE');
    } else if (event === 'sync-start') {
      this.connectionState.setState('SYNCING');
    } else if (event === 'sync-failed') {
      this.connectionState.setState('ERROR');
    } else if (event === 'sync-success' || event === 'sync-skipped') {
      this.connectionState.setState('CONNECTED');
    } else if (event === 'sync-retry') {
      this.connectionState.setState('SYNCING'); // リトライ試行中も同期動作中とする
    }

    this.listeners.forEach(listener => {
      try {
        listener(event, details);
      } catch (err) {
        console.error('[SynchronizationScheduler] Error in event listener callback:', err);
      }
    });
  }

  /**
   * 定期同期タスクのループを開始する
   */
  startScheduler(syncTask: () => Promise<boolean | void>, intervalMs = 15000): void {
    this.stopScheduler();
    this.emit('sync-success'); // 初期起動状態

    this.syncTimer = setInterval(async () => {
      // 1. オフラインポリシー判定
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        this.emit('sync-offline');
        return;
      }

      if (this.isSyncing) return;
      this.isSyncing = true;
      this.emit('sync-start');

      const startTime = Date.now();
      let retryCount = 0;

      try {
        // 指数バックオフ付きリトライを実行
        const result = await this.retryController.execute(
          async () => await syncTask(),
          (error, attempt, nextDelayMs) => {
            retryCount = attempt;
            this.emit('sync-retry', { error, attempt, nextDelayMs });
          }
        );

        const duration = Date.now() - startTime;
        this.totalSyncCount++;
        this.totalSyncDuration += duration;
        this.maxSyncTime = Math.max(this.maxSyncTime, duration);
        this.totalRetryCount += retryCount;

        this.lastSyncTime = Date.now();
        this.lastSyncDuration = duration;
        this.lastRetryCount = retryCount;

        if (result === false) {
          this.emit('sync-skipped');
        } else {
          this.emit('sync-success');
        }
      } catch (err) {
        const duration = Date.now() - startTime;
        this.totalSyncCount++;
        this.totalSyncDuration += duration;
        this.maxSyncTime = Math.max(this.maxSyncTime, duration);
        this.totalRetryCount += retryCount;

        this.lastSyncDuration = duration;
        this.lastRetryCount = retryCount;
        console.error('[SynchronizationScheduler] Periodic sync task failed after retries:', err);
        this.emit('sync-failed', err);
      } finally {
        this.isSyncing = false;
      }
    }, intervalMs);
  }

  /**
   * 定期同期タスクのループを停止する
   */
  stopScheduler(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.emit('sync-offline');
  }

  /**
   * 即時同期タスクをトリガー（実行）する
   */
  async triggerImmediateSync(syncTask: () => Promise<boolean | void>): Promise<boolean> {
    if (this.isSyncing) {
      console.warn('[SynchronizationScheduler] Immediate sync skipped: Already syncing.');
      return false;
    }

    // オフライン判定
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.emit('sync-offline');
      return false;
    }

    this.isSyncing = true;
    this.emit('sync-start');

    const startTime = Date.now();
    let retryCount = 0;

    try {
      const result = await this.retryController.execute(
        async () => await syncTask(),
        (error, attempt, nextDelayMs) => {
          retryCount = attempt;
          this.emit('sync-retry', { error, attempt, nextDelayMs });
        }
      );

      const duration = Date.now() - startTime;
      this.totalSyncCount++;
      this.totalSyncDuration += duration;
      this.maxSyncTime = Math.max(this.maxSyncTime, duration);
      this.totalRetryCount += retryCount;

      this.lastSyncTime = Date.now();
      this.lastSyncDuration = duration;
      this.lastRetryCount = retryCount;

      if (result === false) {
        this.emit('sync-skipped');
      } else {
        this.emit('sync-success');
      }
      return true;
    } catch (err) {
      const duration = Date.now() - startTime;
      this.totalSyncCount++;
      this.totalSyncDuration += duration;
      this.maxSyncTime = Math.max(this.maxSyncTime, duration);
      this.totalRetryCount += retryCount;

      this.lastSyncDuration = duration;
      this.lastRetryCount = retryCount;
      console.error('[SynchronizationScheduler] Immediate sync task failed:', err);
      this.emit('sync-failed', err);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 現在の同期動作のメトリクスを取得
   */
  getMetrics(): {
    lastSyncTime: number;
    lastSyncDuration: number;
    lastRetryCount: number;
    totalSyncCount: number;
    averageSyncTime: number;
    maxSyncTime: number;
    averageRetryCount: number;
    totalOfflineDuration: number;
  } {
    const avgSyncTime = this.totalSyncCount > 0 ? Number((this.totalSyncDuration / this.totalSyncCount).toFixed(2)) : 0;
    const avgRetry = this.totalSyncCount > 0 ? Number((this.totalRetryCount / this.totalSyncCount).toFixed(2)) : 0;
    
    // 現在もオフライン中の場合、現在までのオフライン時間を加算して報告
    let currentOfflineDuration = this.totalOfflineDuration;
    if (this.offlineStartTime > 0) {
      currentOfflineDuration += Date.now() - this.offlineStartTime;
    }

    return {
      lastSyncTime: this.lastSyncTime,
      lastSyncDuration: this.lastSyncDuration,
      lastRetryCount: this.lastRetryCount,
      totalSyncCount: this.totalSyncCount,
      averageSyncTime: avgSyncTime,
      maxSyncTime: this.maxSyncTime,
      averageRetryCount: avgRetry,
      totalOfflineDuration: currentOfflineDuration
    };
  }
}
