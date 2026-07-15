/**
 * DashboardInsightAdapter.js
 * 
 * インサイトオブジェクトを表示用ビューモデルへマッピングするアダプター。
 */

class DashboardInsightAdapter {
  /**
   * インサイトオブジェクトを表示用モデルにマッピングする
   * @param {object} insight 
   * @returns {object} ビューモデル
   */
  static adapt(insight) {
    if (!insight) return null;

    const count = insight.trendData ? insight.trendData.count : 0;
    const ratio = insight.trendData ? Math.round(insight.trendData.ratio * 100) : 0;
    const timeLabel = (insight.trendData && insight.trendData.timeRange && insight.trendData.timeRange.start) ? 
                      `${insight.trendData.timeRange.start} - ${insight.trendData.timeRange.end}` : 'N/A';

    return {
      insightId: insight.insightId,
      title: insight.summary || `Telemetry Insight ${insight.insightId}`,
      category: (insight.category || 'runtime').toUpperCase(),
      trendSummary: `Occurrences: ${count} (${ratio}%)`,
      timeRange: timeLabel
    };
  }
}

// グローバル公開
window.DashboardInsightAdapter = DashboardInsightAdapter;
