import { DashboardStateModel } from './DashboardStateModel';
import { DashboardEventCoordinator } from './DashboardEventCoordinator';
import { SynchronizationScheduler } from './sync/SynchronizationScheduler';

/**
 * DashboardRefreshController.ts
 * 
 * ダッシュボードの手動/自動データ更新および、連打によるAPI高負荷抑止
 * （10秒ガード）、および自動ポーリングを統制するコントローラー。
 * 同期ループや指数バックオフ等の具体的な同期制御は SynchronizationScheduler へ委譲する。
 */
export class DashboardRefreshController {
  private readonly stateModel: DashboardStateModel;
  private readonly coordinator: DashboardEventCoordinator;
  private readonly scheduler: SynchronizationScheduler;

  private lastManualRefreshAt = 0;
  private readonly refreshLockMs = 10000; // 10秒制限

  constructor(
    stateModel: DashboardStateModel,
    coordinator: DashboardEventCoordinator,
    scheduler: SynchronizationScheduler
  ) {
    this.stateModel = stateModel;
    this.coordinator = coordinator;
    this.scheduler = scheduler;
  }

  /**
   * ユーザー主導の手動データ更新
   */
  async triggerManualRefresh(tenantId: string, branchId: string): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastManualRefreshAt < this.refreshLockMs) {
      console.warn('[DashboardRefreshController] APIリクエストは10秒間ロックされています。過度なAPIコールを抑止します。');
      this.coordinator.emit('refresh-locked');
      return false;
    }

    this.lastManualRefreshAt = now;
    this.coordinator.emit('refresh-start');

    // スケジューラを使用してリトライ・状態管理付きで即時同期を実行
    const success = await this.scheduler.triggerImmediateSync(async () => {
      await this.stateModel.loadDashboard(tenantId, branchId, true);
    });

    if (success) {
      this.coordinator.emit('refresh-success');
    } else {
      this.coordinator.emit('refresh-error', new Error('Manual refresh failed'));
    }
    return success;
  }

  /**
   * 自動データポーリングを開始（デフォルト1分周期）
   */
  startAutoPolling(tenantId: string, branchId: string, intervalMs = 60000): void {
    // スケジューラで全体同期周期を制御
    this.scheduler.startScheduler(async () => {
      this.coordinator.emit('auto-poll-start');
      try {
        await this.stateModel.loadDashboard(tenantId, branchId, false);
        this.coordinator.emit('auto-poll-success');
      } catch (err) {
        this.coordinator.emit('auto-poll-error', err);
        throw err; // スケジューラのリトライにエラーを伝播
      }
    }, intervalMs);
  }

  /**
   * 自動データポーリングを停止（アンロード用）
   */
  stopAutoPolling(): void {
    this.scheduler.stopScheduler();
  }

  /**
   * H-App イベント受信時の即時処理トリガー
   */
  handleHAppEventReceived(): void {
    console.log('[DashboardRefreshController] H-App event received. Ensuring immediate view updates.');
    this.coordinator.emit('happ-event-processed');
  }
}
