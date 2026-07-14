import { OperationalStatusManager, OperationalStatus } from './OperationalStatusManager';

/**
 * Health Thresholds configuration structure
 */
export interface HealthThresholds {
  readonly SYNC_WARNING_MS: number;
  readonly SYNC_ERROR_MS: number;
  readonly RETRY_WARNING_COUNT: number;
}

export const DEFAULT_THRESHOLDS: HealthThresholds = {
  SYNC_WARNING_MS: 60000,   // 60秒
  SYNC_ERROR_MS: 180000,   // 180秒
  RETRY_WARNING_COUNT: 2    // 2回
};

export class SystemHealthMonitor {
  private readonly statusManager: OperationalStatusManager;
  private readonly thresholds: HealthThresholds;

  // モニタ対象の各サブコンポーネント状態
  private isGasAvailable = true;
  private isSpreadsheetLoaded = true;
  private isGoogleMapsLoaded = true;
  private lastSyncTime = 0;
  private lastSyncRetryCount = 0;
  private isOfflineState = false;

  private evaluationTimer: any = null;

  constructor(statusManager: OperationalStatusManager, thresholds = DEFAULT_THRESHOLDS) {
    this.statusManager = statusManager;
    this.thresholds = thresholds;
  }

  /**
   * ヘルス状態監視のループ処理を開始
   */
  startMonitor(intervalMs = 5000): void {
    this.stopMonitor();
    this.evaluateHealth(); // 初回評価
    this.evaluationTimer = setInterval(() => {
      this.evaluateHealth();
    }, intervalMs);
  }

  /**
   * ヘルス状態監視のループを停止
   */
  stopMonitor(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = null;
    }
  }

  // 状態監視インプットの設定更新メソッド群
  setGasAvailable(available: boolean): void {
    this.isGasAvailable = available;
    this.evaluateHealth();
  }

  setSpreadsheetLoaded(loaded: boolean): void {
    this.isSpreadsheetLoaded = loaded;
    this.evaluateHealth();
  }

  setGoogleMapsLoaded(loaded: boolean): void {
    this.isGoogleMapsLoaded = loaded;
    this.evaluateHealth();
  }

  updateSyncMetrics(lastSyncTime: number, retryCount: number): void {
    this.lastSyncTime = lastSyncTime;
    this.lastSyncRetryCount = retryCount;
    this.evaluateHealth();
  }

  setOffline(offline: boolean): void {
    this.isOfflineState = offline;
    this.evaluateHealth();
  }

  /**
   * 各監視項目の状態を総合してヘルス評価を行い、状態マネージャを遷移させる
   */
  evaluateHealth(): void {
    // 1. オフラインチェック
    if (this.isOfflineState) {
      this.statusManager.setStatus('OFFLINE');
      return;
    }

    // 2. 重大エラーの検証 (GAS呼び出し不可, スプレッドシート未読込, 地図ロード不可, 同期許容限界超過)
    const now = Date.now();
    const syncDelay = this.lastSyncTime > 0 ? now - this.lastSyncTime : 0;
    
    const hasFatalSyncDelay = this.lastSyncTime > 0 && syncDelay >= this.thresholds.SYNC_ERROR_MS;

    if (!this.isGasAvailable || !this.isSpreadsheetLoaded || !this.isGoogleMapsLoaded || hasFatalSyncDelay) {
      this.statusManager.setStatus('ERROR');
      return;
    }

    // 3. 警告状態の検証 (リトライ限界到達, 同期注意ディレイ超過)
    const hasSyncDelayWarning = this.lastSyncTime > 0 && syncDelay >= this.thresholds.SYNC_WARNING_MS;
    const hasRetryWarning = this.lastSyncRetryCount >= this.thresholds.RETRY_WARNING_COUNT;

    if (hasSyncDelayWarning || hasRetryWarning) {
      this.statusManager.setStatus('WARNING');
      return;
    }

    // 4. 正常
    this.statusManager.setStatus('NORMAL');
  }
}
