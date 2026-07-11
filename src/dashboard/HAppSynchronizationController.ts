import { DashboardStateModel, EventLogItem } from './DashboardStateModel';
import { HAppConnectionState } from './HAppConnectionState';
import { HAppEventSubscriber } from './HAppEventSubscriber';
import { DashboardDataMapper } from './DashboardDataMapper';

/**
 * HAppSynchronizationController.ts
 * 
 * H-App から送信された差分 EventLog を定期的に GAS API から取得し、
 * ダッシュボードの状態へと同期させる同期管理クラス（同期用コントローラー）。
 */
export class HAppSynchronizationController {
  private readonly stateModel: DashboardStateModel;
  private readonly subscriber: HAppEventSubscriber;
  private readonly connectionState: HAppConnectionState;

  private syncTimer: any = null;
  private isSyncing = false;
  private lastSyncTimestamp = 0;
  private lastEventId = '';

  constructor(
    stateModel: DashboardStateModel,
    subscriber: HAppEventSubscriber,
    connectionState: HAppConnectionState
  ) {
    this.stateModel = stateModel;
    this.subscriber = subscriber;
    this.connectionState = connectionState;
    // 起動時の初期タイムスタンプを設定
    this.lastSyncTimestamp = Date.now();
  }

  /**
   * 同期ループ（ポーリング）の開始 (将来的に WebSocket/SSE 等へ置き換え可能)
   */
  startSyncLoop(tenantId: string, branchId: string, intervalMs = 15000): void {
    this.stopSyncLoop();
    this.connectionState.setState('CONNECTED');

    this.syncTimer = setInterval(async () => {
      // オフライン状態の時はリクエストを自発的に一時停止 (Offline Policy)
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.connectionState.setState('OFFLINE');
        return;
      }
      await this.syncNewEvents(tenantId, branchId);
    }, intervalMs);
  }

  /**
   * 同期ループの停止
   */
  stopSyncLoop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.connectionState.setState('OFFLINE');
  }

  /**
   * GAS API (getEventLog) を用いて差分 EventLog を取得・同期する
   */
  async syncNewEvents(tenantId: string, branchId: string): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.connectionState.setState('SYNCING');

    try {
      const client = (this.stateModel as any).client;
      // limit は多めに50件、sinceTimestamp に lastSyncTimestamp を設定
      const response = await client.getEventLog(50, this.lastSyncTimestamp);

      if (response.success && response.data) {
        const rawLogs = Array.isArray(response.data.logs) ? response.data.logs : [];

        if (rawLogs.length > 0) {
          // タイムスタンプ順（古い順）に処理するため、マッピングとソートを行う
          const mappedLogs: EventLogItem[] = rawLogs
            .map((l: any) => DashboardDataMapper.mapEventLogItem(l))
            .sort((a: EventLogItem, b: EventLogItem) => a.timestamp - b.timestamp);

          mappedLogs.forEach((log: EventLogItem) => {
            // タイムスタンプおよびイベントIDを用いた差分取得フィルタリング
            if (log.timestamp < this.lastSyncTimestamp) {
              return; // 既に処理された古いイベント
            }
            if (log.timestamp === this.lastSyncTimestamp && log.id === this.lastEventId) {
              return; // 直近のイベントと同一の重複イベント
            }

            // subscriber 経由で追加
            this.subscriber.handleIncomingEvent(log);

            // 同期カーソルを更新
            this.lastSyncTimestamp = log.timestamp;
            this.lastEventId = log.id;
          });
        }
        this.connectionState.setState('CONNECTED');
      } else {
        this.connectionState.setState('ERROR');
      }
    } catch (err) {
      console.error('[HAppSynchronizationController] Synchronization error:', err);
      this.connectionState.setState('ERROR');
    } finally {
      this.isSyncing = false;
    }
  }

  // テストおよびデバッグ用ゲッター
  getLastSyncTimestamp(): number {
    return this.lastSyncTimestamp;
  }

  getLastEventId(): string {
    return this.lastEventId;
  }
}
