/**
 * DashboardKnowledgeAdapter.js
 * 
 * ナレッジオブジェクトを UI 表示用のビューモデルに安全に変換するアダプター。
 */

class DashboardKnowledgeAdapter {
  /**
   * 単一のナレッジオブジェクトを表示用モデルにマッピングする
   * @param {object} knowledge 
   * @returns {object} ビューモデル
   */
  static adapt(knowledge) {
    if (!knowledge) return null;

    const count = knowledge.eventIds ? knowledge.eventIds.length : 0;
    const timeLabel = (knowledge.timestampRange && knowledge.timestampRange.start) ? 
                      `${knowledge.timestampRange.start} - ${knowledge.timestampRange.end}` : 'Unknown Period';
    const sourceLabel = knowledge.source || 'Kernel';

    return {
      knowledgeId: knowledge.knowledgeId,
      title: knowledge.summary || `Knowledge Entry ${knowledge.knowledgeId}`,
      category: (knowledge.category || 'runtime').toUpperCase(),
      eventCount: count,
      timeLabel,
      sourceLabel
    };
  }
}

// グローバル公開
window.DashboardKnowledgeAdapter = DashboardKnowledgeAdapter;
