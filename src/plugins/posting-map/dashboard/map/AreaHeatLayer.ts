/**
 * AreaHeatLayer.ts
 * 
 * 地区別視覚レイヤー管理。
 * 投票率（VoteTurnoutLayer）と活動進捗（ActivityProgressLayer）のカラー強度・表示スタイルを算出し、
 * 総合スコアによる合成を行わず、それぞれ独立したレイヤーとして可視化する。
 */

export interface LayerStyle {
  readonly color: string;
  readonly backgroundColor: string;
  readonly boxShadow: string;
  readonly borderColor: string;
}

export class AreaHeatLayer {

  /**
   * 1. 活動進捗レイヤーのスタイル算出 (ActivityProgressLayer)
   */
  static getActivityProgressStyle(progressRate: number): LayerStyle {
    if (progressRate >= 100) {
      return {
        color: '#10b981', // エメラルドグリーン
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)',
        borderColor: 'rgba(16, 185, 129, 0.4)'
      };
    } else if (progressRate > 0) {
      return {
        color: '#3b82f6', // ブルー
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.25)',
        borderColor: 'rgba(59, 130, 246, 0.4)'
      };
    } else {
      return {
        color: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        boxShadow: 'none',
        borderColor: 'rgba(255, 255, 255, 0.06)'
      };
    }
  }

  /**
   * 2. 投票率レイヤーのスタイル算出 (VoteTurnoutLayer)
   */
  static getVoteTurnoutStyle(turnoutRate: number): LayerStyle {
    if (turnoutRate >= 0.70) {
      return {
        color: '#a855f7', // 鮮明なパープル（高投票率）
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)',
        borderColor: 'rgba(168, 85, 247, 0.5)'
      };
    } else if (turnoutRate >= 0.50) {
      return {
        color: '#c084fc', // 薄紫 (中投票率)
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.15)',
        borderColor: 'rgba(168, 85, 247, 0.25)'
      };
    } else {
      return {
        color: 'rgba(255, 255, 255, 0.4)', // 暗灰色 (低投票率)
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        boxShadow: 'none',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      };
    }
  }
}
