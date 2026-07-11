/**
 * DashboardApplication.ts
 * 
 * ダッシュボード全体の起動プロセス・初期化ライフサイクル、および
 * API, State, UI, Mediator(EventCoordinator), Polling の統合制御を行う
 * アプリケーションマネージャー。
 */

import { DashboardApiClient } from './DashboardApiClient';
import { DashboardStateModel } from './DashboardStateModel';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardEventCoordinator } from './DashboardEventCoordinator';
import { DashboardRefreshController } from './DashboardRefreshController';
import { HAppConnectionState } from './HAppConnectionState';
import { EventLogDispatcher } from './EventLogDispatcher';
import { HAppEventSubscriber } from './HAppEventSubscriber';
import { HAppSynchronizationController } from './HAppSynchronizationController';

export class DashboardApplication {
  private static instance: DashboardApplication | null = null;

  private client!: DashboardApiClient;
  private stateModel!: DashboardStateModel;
  private layout!: DashboardLayout;
  private eventCoordinator!: DashboardEventCoordinator;
  private refreshController!: DashboardRefreshController;
  private connectionState!: HAppConnectionState;
  private eventLogDispatcher!: EventLogDispatcher;
  private eventSubscriber!: HAppEventSubscriber;
  private syncController!: HAppSynchronizationController;

  private constructor() {}

  /**
   * シングルトンインスタンスの取得
   */
  static getInstance(): DashboardApplication {
    if (!DashboardApplication.instance) {
      DashboardApplication.instance = new DashboardApplication();
    }
    return DashboardApplication.instance;
  }

  /**
   * システム起動フローの実行
   */
  async start(
    container: HTMLElement,
    apiUrl: string,
    tenantId: string,
    branchId: string
  ): Promise<void> {
    console.log('[DashboardApplication] Control station booting...');

    // 1. APIクライアント構築
    this.client = new DashboardApiClient(apiUrl);

    // 2. 状態管理モデル構築
    this.stateModel = new DashboardStateModel(this.client);

    // 3. UIレイアウト構築
    this.layout = new DashboardLayout(this.stateModel);

    // 4. イベントコーディネーター（メディエーター）構築
    this.eventCoordinator = new DashboardEventCoordinator(this.stateModel, this.layout);

    // 5. データ更新（ポーリング）制御構築
    this.refreshController = new DashboardRefreshController(this.stateModel, this.eventCoordinator);

    // 5.5. H-App 同期モジュール群の構築
    this.connectionState = new HAppConnectionState();
    this.eventLogDispatcher = new EventLogDispatcher();
    this.eventSubscriber = new HAppEventSubscriber(this.stateModel, this.eventLogDispatcher);
    this.syncController = new HAppSynchronizationController(
      this.stateModel,
      this.eventSubscriber,
      this.connectionState
    );

    // 5.6. 同期された EventLog の UI 配信フックの定義
    this.eventLogDispatcher.subscribe((log) => {
      const mapPanel = (this.layout as any).mapPanel;
      if (mapPanel && (mapPanel as any).mapEngine) {
        (mapPanel as any).mapEngine.updateLayer('activity', { logs: this.stateModel.getEventLogs() });
        mapPanel.updateAreas(this.stateModel.getData()?.areas || []);
      }

      const detailPanel = (this.layout as any).detailPanel;
      if (detailPanel && (detailPanel as any).currentAreaId === log.areaId) {
        const area = this.stateModel.getData()?.areas.find(a => a.areaId === log.areaId);
        if (area) {
          detailPanel.updateDetails(area, this.stateModel.getVoteTurnouts(), this.stateModel.getEventLogs());
        }
      }

      // RefreshController への通知
      this.refreshController.handleHAppEventReceived();
    });

    // 6. レイアウト構成コンポーネント間のイベント関係性をコーディネーターにバインド
    const mapPanel = (this.layout as any).mapPanel;
    if (mapPanel) {
      mapPanel.onAreaSelected((areaId: string) => {
        this.eventCoordinator.handleAreaSelected(areaId);
      });
    }

    const detailPanel = (this.layout as any).detailPanel;
    if (detailPanel) {
      const originalHide = detailPanel.hide;
      if (typeof originalHide === 'function') {
        detailPanel.hide = () => {
          originalHide.call(detailPanel);
          this.eventCoordinator.handleDetailClosed();
        };
      }
    }

    // 7. DOMへのマウント
    container.innerHTML = ''; // コンテナのクリア
    container.appendChild(this.layout.getElement());

    // 8. 初期データ同期 (Real Data First)
    try {
      await this.stateModel.loadDashboard(tenantId, branchId, true);
      console.log('[DashboardApplication] Boot process complete. Initial state mapped.');
    } catch (err) {
      console.error('[DashboardApplication] Failed to complete initial synchronisation', err);
    }

    // 9. 自動データリフレッシュ周期の起動 (1分周期)
    this.refreshController.startAutoPolling(tenantId, branchId);

    // 10. H-App 同期ループの起動 (15秒周期)
    this.syncController.startSyncLoop(tenantId, branchId, 15000);
  }

  /**
   * システム終了処理（メモリリーク防止用）
   */
  destroy(): void {
    console.log('[DashboardApplication] Shutdown and cleanup...');
    if (this.syncController) {
      this.syncController.stopSyncLoop();
    }
    if (this.refreshController) {
      this.refreshController.stopAutoPolling();
    }
    const element = this.layout ? this.layout.getElement() : null;
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    DashboardApplication.instance = null;
  }
}
export default DashboardApplication;
