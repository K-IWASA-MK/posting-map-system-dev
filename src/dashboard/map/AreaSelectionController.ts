/**
 * AreaSelectionController.ts
 * 
 * 地図上で地区が選択・クリックされた際、
 * 対象AreaのIDを取得し、ダッシュボード詳細パネルへの更新・同期ロードを仲介するコントローラー。
 */

import { DashboardStateModel } from '../DashboardStateModel';
import { AreaDetailPanel } from '../components/AreaDetailPanel';

export class AreaSelectionController {
  private readonly model: DashboardStateModel;
  private readonly detailPanel: AreaDetailPanel;

  constructor(model: DashboardStateModel, detailPanel: AreaDetailPanel) {
    this.model = model;
    this.detailPanel = detailPanel;
  }

  /**
   * 地区がクリック選択された際のフロー制御
   */
  async selectArea(areaId: string): Promise<void> {
    const data = this.model.getData();
    if (!data) return;

    const area = data.areas.find(a => a.areaId === areaId);
    if (!area) {
      console.warn(`[AreaSelectionController] Area not found in state: ${areaId}`);
      return;
    }

    try {
      // 1. 同期的に関連する投票率と活動ログを非同期取得する
      await Promise.all([
        this.model.loadVoteTurnout(areaId),
        this.model.loadEventLogs(20) // 直近20件
      ]);

      // 2. 詳細パネルにバインドして展開表示する (Click = Animation)
      this.detailPanel.updateDetails(
        area,
        this.model.getVoteTurnouts(),
        this.model.getEventLogs()
      );
    } catch (err) {
      console.error('[AreaSelectionController] Failed to select area', err);
    }
  }
}
