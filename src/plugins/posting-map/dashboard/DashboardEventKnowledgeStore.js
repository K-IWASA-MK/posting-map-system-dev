/**
 * DashboardEventKnowledgeStore.js
 * 
 * 抽出・生成されたナレッジデータ（Knowledge Object）を最大 500 件保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、異常判定、推奨生成ロジックの実装は厳禁である。
 */

class DashboardEventKnowledgeStore {
  static knowledges = [];
  static maxCapacity = 500;

  /**
   * ナレッジオブジェクトを追加する
   * @param {object} knowledge 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static addKnowledge(knowledge) {
    if (!knowledge || !knowledge.knowledgeId) return false;

    // 1. 重複チェック
    const isDuplicate = this.knowledges.some(k => k.knowledgeId === knowledge.knowledgeId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Knowledge Store] 重複ナレッジ登録検知。DROP: ${knowledge.knowledgeId}`);
      return false;
    }

    const activeTenantId = (window.DashboardTenantContext && window.DashboardTenantContext.getContext())
      ? window.DashboardTenantContext.getContext().tenantId
      : 'DEFAULT';

    // 2. 厳格な不変性（Object.freeze）の適用
    const frozenKnowledge = Object.freeze({
      tenantId: knowledge.tenantId || activeTenantId,
      knowledgeId: knowledge.knowledgeId,
      eventIds: Object.freeze([...(knowledge.eventIds || [])]),
      category: knowledge.category || 'runtime',
      source: knowledge.source || 'Kernel',
      timestampRange: Object.freeze({
        start: (knowledge.timestampRange && knowledge.timestampRange.start) ? knowledge.timestampRange.start : '',
        end: (knowledge.timestampRange && knowledge.timestampRange.end) ? knowledge.timestampRange.end : ''
      }),
      summary: knowledge.summary || '',
      metadata: Object.freeze({ ...(knowledge.metadata || {}) })
    });

    this.knowledges.push(frozenKnowledge);

    // 3. 最大保持数（500件）の適用
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 容量上限超過時の切り落とし
   */
  static applyCapacityLimit() {
    if (this.knowledges.length > this.maxCapacity) {
      const dropped = this.knowledges.splice(0, this.knowledges.length - this.maxCapacity);
      console.log(`[Dashboard Event Knowledge Store] 容量上限（500件）超過により ${dropped.length} ナレッジを破棄しました。`);
    }
  }

  /**
   * ナレッジ一覧の取得
   */
  static getKnowledges() {
    return this.knowledges;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.knowledges = [];
    console.log('[Dashboard Event Knowledge Store] ストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventKnowledgeStore = DashboardEventKnowledgeStore;
