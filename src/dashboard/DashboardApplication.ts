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
import { CacheManager } from './sync/CacheManager';
import { ConflictResolver } from './sync/ConflictResolver';
import { DeltaSynchronizationManager } from './sync/DeltaSynchronizationManager';
import { RetryController } from './sync/RetryController';
import { SynchronizationScheduler } from './sync/SynchronizationScheduler';
import { SystemHealthMonitor } from './operations/SystemHealthMonitor';
import { OperationalStatusManager } from './operations/OperationalStatusManager';
import { MetricsAggregator } from './operations/MetricsAggregator';
import { NotificationCenter } from './operations/NotificationCenter';

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
  private cacheManager!: CacheManager;
  private conflictResolver!: ConflictResolver;
  private refreshScheduler!: SynchronizationScheduler;
  private appRetryController!: RetryController;

  private healthMonitor!: SystemHealthMonitor;
  private statusManager!: OperationalStatusManager;
  private metricsAggregator!: MetricsAggregator;
  private notificationCenter!: NotificationCenter;

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

    // 0. 同期・キャッシュ共通基盤の構築
    this.cacheManager = new CacheManager();
    this.conflictResolver = new ConflictResolver();
    this.appRetryController = new RetryController(3, 1000, 2);

    // 1. APIクライアント構築
    this.client = new DashboardApiClient(apiUrl);

    // 2. 状態管理モデル構築
    this.stateModel = new DashboardStateModel(this.client);

    // 3. UIレイアウト構築
    this.layout = new DashboardLayout(this.stateModel);

    // 4. イベントコーディネーター（メディエーター）構築
    this.eventCoordinator = new DashboardEventCoordinator(this.stateModel, this.layout);

    // 4.5. H-App 同期状態・ディスパッチャの構築
    this.connectionState = new HAppConnectionState();
    this.eventLogDispatcher = new EventLogDispatcher();
    this.eventSubscriber = new HAppEventSubscriber(this.stateModel, this.eventLogDispatcher);

    // 4.6. 全体同期スケジューラの構築
    this.refreshScheduler = new SynchronizationScheduler(this.connectionState, this.appRetryController);

    // 4.8. 運用管理モジュールの初期化とDI統合
    this.statusManager = new OperationalStatusManager();
    this.healthMonitor = new SystemHealthMonitor(this.statusManager);
    this.metricsAggregator = new MetricsAggregator(this.cacheManager, this.refreshScheduler, this.conflictResolver);
    this.notificationCenter = new NotificationCenter();

    // 4.8.1. 運用状態・インジケータイベントの接続
    this.statusManager.subscribe((status) => {
      this.eventCoordinator.emit('health-changed', status);
      const header = (this.layout as any).header;
      if (header && typeof header.updateHealth === 'function') {
        header.updateHealth(status);
      }
    });

    this.notificationCenter.subscribe((item) => {
      this.eventCoordinator.emit('notification-added', item);
    });

    const updateMetricsDisplay = () => {
      const metrics = this.metricsAggregator.getMetrics();
      this.eventCoordinator.emit('metrics-updated', metrics);
      const header = (this.layout as any).header;
      if (header && typeof header.updateMetrics === 'function') {
        header.updateMetrics({
          lastSyncTime: metrics.lastSyncTime,
          lastSyncDuration: metrics.lastSyncDuration,
          lastRetryCount: metrics.lastRetryCount
        });
      }
    };

    // 4.7. スケジューライベントのコーディネーター転送設定
    this.refreshScheduler.subscribe((event, details) => {
      console.log(`[DashboardApplication] Refresh scheduler event: ${event}`);
      this.eventCoordinator.emit(`scheduler-${event}`, details);
      
      updateMetricsDisplay();
      this.healthMonitor.updateSyncMetrics(
        this.refreshScheduler.getMetrics().lastSyncTime,
        this.refreshScheduler.getMetrics().lastRetryCount
      );

      if (event === 'sync-success') {
        this.notificationCenter.addNotification('Sync Success', 'ダッシュボードの同期が正常に完了しました。');
      } else if (event === 'sync-failed') {
        this.notificationCenter.addNotification('Sync Failed', `同期エラーが発生しました: ${details || ''}`);
      } else if (event === 'sync-retry') {
        this.notificationCenter.addNotification('Retry Started', `接続リトライ中... (試行: ${details?.attempt || ''})`);
      } else if (event === 'sync-offline') {
        this.notificationCenter.addNotification('Offline', 'ネットワーク切断を検知しました。');
        this.healthMonitor.setOffline(true);
      }
    });

    this.connectionState.subscribe((state) => {
      if (state === 'CONNECTED') {
        this.healthMonitor.setOffline(false);
        this.notificationCenter.addNotification('Recovery', 'ネットワーク接続が復旧しました。');
      }
    });

    // 5. データ更新（ポーリング）制御構築
    this.refreshController = new DashboardRefreshController(
      this.stateModel,
      this.eventCoordinator,
      this.refreshScheduler
    );

    // 5.5. H-App 同期コントローラーの構築 (独自のdeltaManager/schedulerを介して動作)
    const hapDeltaManager = new DeltaSynchronizationManager();
    const hapRetryController = new RetryController(3, 1000, 2);
    const hapScheduler = new SynchronizationScheduler(this.connectionState, hapRetryController);

    hapScheduler.subscribe((event, details) => {
      console.log(`[DashboardApplication] H-App scheduler event: ${event}`);
      this.eventCoordinator.emit(`scheduler-${event}`, details);
    });

    this.syncController = new HAppSynchronizationController(
      this.stateModel,
      this.eventSubscriber,
      this.connectionState,
      hapDeltaManager,
      hapScheduler
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

    // 6.5. ヘッダー連携およびイベントのバインド
    const header = (this.layout as any).header;
    if (header && typeof header.setCoordinator === 'function') {
      header.setCoordinator(this.eventCoordinator);
    }

    // refresh-requested の処理登録
    this.eventCoordinator.on('refresh-requested', async () => {
      console.log('[DashboardApplication] Force Refresh requested via EventCoordinator.');
      this.cacheManager.clear();
      if (this.syncController && (this.syncController as any).deltaManager) {
        (this.syncController as any).deltaManager.resetPointer(0);
      }
      this.notificationCenter.addNotification('Cache Cleared', 'キャッシュを完全に無効化し、再読み込みを実行します。');
      try {
        await this.refreshController.triggerManualRefresh(tenantId, branchId);
      } catch (err) {
        console.error('[DashboardApplication] Manual force refresh failed:', err);
      }
    });

    // ヘルス監視の起動 (5秒周期)
    this.healthMonitor.startMonitor(5000);

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
    if (this.healthMonitor) {
      this.healthMonitor.stopMonitor();
    }
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
