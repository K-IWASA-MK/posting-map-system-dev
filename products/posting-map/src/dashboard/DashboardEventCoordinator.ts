/**
 * DashboardEventCoordinator.ts
 * 
 * ダッシュボード各コンポーネント（MapPanel, AreaDetailPanel 等）間の連携・仲介を担当する
 * メディエータークラス。
 */

import { DashboardStateModel } from './DashboardStateModel';
import { DashboardLayout } from './components/DashboardLayout';

export class DashboardEventCoordinator {
  private readonly stateModel: DashboardStateModel;
  private readonly layout: DashboardLayout;
  private readonly listeners: Record<string, ((...args: any[]) => void)[]> = {};

  constructor(stateModel: DashboardStateModel, layout: DashboardLayout) {
    this.stateModel = stateModel;
    this.layout = layout;
  }

  /**
   * イベント購読
   * サポートするイベント:
   * - 'refresh-requested': 手動強制クリア＆同期要求
   * - 'health-changed': システム健全状態の変更 (OperationalStatus)
   * - 'metrics-updated': 統合メトリクスの更新 (AggregatedMetrics)
   * - 'notification-added': 運用ポップアップの追加 (NotificationItem)
   * - 'distribution-updated': 配布進捗状況の更新
   * - 'inventory-updated': チラシ在庫状況の更新
   * - 'gps-updated': 配布員のGPS座標の更新
   * - 'photo-updated': 写真提出の更新
   * - 'field-status-changed': 現場運用全体のメトリクス更新
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * イベント発行
   */
  emit(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }

  /**
   * エリア選択イベントのハンドリング
   */
  async handleAreaSelected(areaId: string): Promise<void> {
    this.emit('area-selected-start', areaId);

    const data = this.stateModel.getData();
    if (!data) return;

    const area = data.areas.find(a => a.areaId === areaId);
    if (!area) {
      console.warn(`[DashboardEventCoordinator] Area not found in state: ${areaId}`);
      this.emit('area-selected-error', areaId, new Error('Area not found'));
      return;
    }

    try {
      // 1. 地図のハイライト表示更新
      const mapPanel = (this.layout as any).mapPanel;
      if (mapPanel && typeof mapPanel.highlightArea === 'function') {
        mapPanel.highlightArea(areaId);
      }

      // 2. 投票率データおよびイベントログの非同期並行取得
      await Promise.all([
        this.stateModel.loadVoteTurnout(areaId),
        this.stateModel.loadEventLogs(20) // 直近20件
      ]);

      // 3. 詳細パネルのバインド更新と展開表示
      const detailPanel = (this.layout as any).detailPanel;
      if (detailPanel && typeof detailPanel.updateDetails === 'function') {
        detailPanel.updateDetails(
          area,
          this.stateModel.getVoteTurnouts(),
          this.stateModel.getEventLogs()
        );
      }

      this.emit('area-selected-success', areaId);
    } catch (err) {
      console.error('[DashboardEventCoordinator] Failed to coordinate area selection', err);
      this.emit('area-selected-error', areaId, err);
    }
  }

  /**
   * 詳細パネルを閉じた際のイベントハンドリング
   */
  handleDetailClosed(): void {
    // 全体の選択状態クリアやハイライトのクリアを行う
    const mapPanel = (this.layout as any).mapPanel;
    if (mapPanel && typeof mapPanel.highlightArea === 'function') {
      mapPanel.highlightArea(''); // ハイライト解除
    }
    this.emit('detail-closed');
  }
}
