/**
 * DashboardRefreshController.ts
 * 
 * ダッシュボードの手動/自動データ更新および、連打によるAPI高負荷抑止
 * （10秒ガード）、および1分周期自動ポーリングを統制するコントローラー。
 */

import { DashboardStateModel } from './DashboardStateModel';
import { DashboardEventCoordinator } from './DashboardEventCoordinator';

export class DashboardRefreshController {
  private readonly stateModel: DashboardStateModel;
  private readonly coordinator: DashboardEventCoordinator;
  private pollingTimer: any = null;
  private lastManualRefreshAt: number = 0;
  private readonly refreshLockMs = 10000; // 10秒制限

  constructor(stateModel: DashboardStateModel, coordinator: DashboardEventCoordinator) {
    this.stateModel = stateModel;
    this.coordinator = coordinator;
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

    try {
      // force=true で強制リロードを指示
      await this.stateModel.loadDashboard(tenantId, branchId, true);
      this.coordinator.emit('refresh-success');
      return true;
    } catch (err) {
      console.error('[DashboardRefreshController] Manual refresh failed', err);
      this.coordinator.emit('refresh-error', err);
      return false;
    }
  }

  /**
   * 自動データポーリングを開始（デフォルト1分周期）
   */
  startAutoPolling(tenantId: string, branchId: string, intervalMs = 60000): void {
    this.stopAutoPolling();
    this.pollingTimer = setInterval(async () => {
      this.coordinator.emit('auto-poll-start');
      try {
        // バックグラウンド同期のため force=false (状態モデルによる10秒制限と共存)
        await this.stateModel.loadDashboard(tenantId, branchId, false);
        this.coordinator.emit('auto-poll-success');
      } catch (err) {
        console.error('[DashboardRefreshController] Auto polling failed', err);
        this.coordinator.emit('auto-poll-error', err);
      }
    }, intervalMs);
  }

  /**
   * 自動データポーリングを停止（アンロード用）
   */
  stopAutoPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * H-App イベント受信時の即時処理トリガー
   */
  handleHAppEventReceived(): void {
    console.log('[DashboardRefreshController] H-App event received. Ensuring immediate view updates.');
    this.coordinator.emit('happ-event-processed');
  }
}
