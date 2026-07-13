/**
 * DashboardInsightBuilder.js
 * 
 * ナレッジ情報から客観的な統計比率や時系列トレンドを静的に算出し、
 * インサイトオブジェクト（Insight Object）を生成するビルダー。
 * 
 * 警告：本ファイル内への異常判定、自律的解決、RCA分析、AI予測ロジックの実装は厳禁である。
 */

class DashboardInsightBuilder {
  /**
   * ナレッジリストから表示用インサイトデータを集計構築する
   * @param {Array} knowledges ナレッジリスト
   * @returns {Array} インサイトオブジェクトリスト
   */
  static build(knowledges) {
    if (!knowledges || knowledges.length === 0) return [];

    const insights = [];
    const totalCount = knowledges.length;

    // カテゴリ定義
    const categories = ['runtime', 'governance', 'quality', 'simulation'];
    
    categories.forEach(cat => {
      const catKnowledges = knowledges.filter(k => k.category.toLowerCase() === cat.toLowerCase());
      const count = catKnowledges.length;
      if (count === 0) return;

      const ratio = totalCount > 0 ? parseFloat((count / totalCount).toFixed(2)) : 0.0;
      const knowledgeIds = catKnowledges.map(k => k.knowledgeId);

      // 時間順に並び替え
      const sorted = [...catKnowledges].sort((a, b) => {
        const tA = (a.timestampRange && a.timestampRange.start) ? new Date(a.timestampRange.start).getTime() : 0;
        const tB = (b.timestampRange && b.timestampRange.start) ? new Date(b.timestampRange.start).getTime() : 0;
        return tA - tB;
      });

      const start = sorted[0]?.timestampRange?.start || '';
      const end = sorted[sorted.length - 1]?.timestampRange?.end || '';

      const insightId = `ins_trend_${cat}_${Date.now()}`;
      
      // 客観的事実のみを記述するサマリー (AI推論は含まない)
      const summary = `Aggregated ${cat} telemetry representing ${Math.round(ratio * 100)}% of total system occurrences.`;

      insights.push({
        insightId,
        knowledgeIds,
        category: cat,
        trendData: {
          count,
          ratio,
          timeRange: { start, end }
        },
        summary,
        metadata: {}
      });
    });

    return insights;
  }
}

// グローバル公開
window.DashboardInsightBuilder = DashboardInsightBuilder;
