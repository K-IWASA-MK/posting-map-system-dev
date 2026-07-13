/**
 * MapDataLayer.ts
 * 
 * エリア詳細・選挙投票率・活動ログから
 * 地図描画・視覚化用のモデル（MapVisualNode）を生成するレイヤー。
 */

import { AreaDetail, VoteTurnout, EventLogItem } from '../DashboardStateModel';

export interface MapVisualNode {
  readonly areaId: string;
  readonly areaName: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly totalHouseholds: number;
  readonly doneCount: number;
  readonly progressRate: number;
  readonly latestTurnout: number;
  readonly historicalTurnouts: readonly VoteTurnout[];
  readonly recentLogs: readonly EventLogItem[];
}

export class MapDataLayer {
  
  /**
   * 各種実データを結合して、地図表示用ノードモデルを構築する (Real Data Integration)
   */
  static buildVisualNodes(
    areas: readonly AreaDetail[],
    allTurnouts: readonly VoteTurnout[],
    allLogs: readonly EventLogItem[]
  ): readonly MapVisualNode[] {
    return Object.freeze(
      areas.map(area => {
        // 対象Areaの過去投票率データをソート（選挙日付降順）
        const areaTurnouts = allTurnouts
          .filter(t => t.areaId === area.areaId)
          .slice()
          .sort((a, b) => b.electionDate.localeCompare(a.electionDate));

        const latestTurnout = areaTurnouts.length > 0 ? areaTurnouts[0].turnoutRate : 0;

        // 対象Areaの最近のイベントログ（日付降順）
        const areaLogs = allLogs
          .filter(l => l.areaId === area.areaId)
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp);

        return {
          areaId: area.areaId,
          areaName: area.areaName,
          latitude: area.latitude,
          longitude: area.longitude,
          totalHouseholds: area.totalHouseholds,
          doneCount: area.doneCount,
          progressRate: area.progressRate,
          latestTurnout,
          historicalTurnouts: Object.freeze(areaTurnouts),
          recentLogs: Object.freeze(areaLogs)
        };
      })
    );
  }
}
