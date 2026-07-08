/**
 * DashboardEventInsightStore.js
 * 
 * 構造化されたインサイトデータ（Insight Object）を最大 100 件保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、推奨生成、および操作トリガーの実装は厳禁である。
 */

class DashboardEventInsightStore {
  static insights = [];
  static maxCapacity = 100;

  /**
   * インサイトオブジェクトを追加する
   * @param {object} insight 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static addInsight(insight) {
    if (!insight || !insight.insightId) return false;

    // 1. 重複チェック
    const isDuplicate = this.insights.some(i => i.insightId === insight.insightId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Insight Store] 重複インサイト登録検知。DROP: ${insight.insightId}`);
      return false;
    }

    const activeTenantId = (window.DashboardTenantContext && window.DashboardTenantContext.getContext())
      ? window.DashboardTenantContext.getContext().tenantId
      : 'DEFAULT';

    // 2. 厳格な不変性（Object.freeze）の適用
    const frozenInsight = Object.freeze({
      tenantId: insight.tenantId || activeTenantId,
      insightId: insight.insightId,
      knowledgeIds: Object.freeze([...(insight.knowledgeIds || [])]),
      category: insight.category || 'runtime',
      trendData: Object.freeze({
        count: insight.trendData ? insight.trendData.count : 0,
        ratio: insight.trendData ? insight.trendData.ratio : 0.0,
        timeRange: Object.freeze({
          start: (insight.trendData && insight.trendData.timeRange) ? insight.trendData.timeRange.start : '',
          end: (insight.trendData && insight.trendData.timeRange) ? insight.trendData.timeRange.end : ''
        })
      }),
      summary: insight.summary || '',
      metadata: Object.freeze({ ...(insight.metadata || {}) })
    });

    this.insights.push(frozenInsight);

    // 3. 最大保持数（100件）の適用
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 容量上限超過時の切り落とし
   */
  static applyCapacityLimit() {
    if (this.insights.length > this.maxCapacity) {
      const dropped = this.insights.splice(0, this.insights.length - this.maxCapacity);
      console.log(`[Dashboard Event Insight Store] 容量上限（100件）超過により ${dropped.length} インサイトを破棄しました。`);
    }
  }

  /**
   * インサイト一覧の取得
   */
  static getInsights() {
    return this.insights;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.insights = [];
    console.log('[Dashboard Event Insight Store] ストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventInsightStore = DashboardEventInsightStore;
