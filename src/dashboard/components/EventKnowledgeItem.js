/**
 * EventKnowledgeItem.js
 * 
 * 単一のナレッジ情報を表示するためのサブコンポーネント。
 */

class EventKnowledgeItem {
  /**
   * ナレッジのビューモデルから HTML を生成する
   * @param {object} viewModel 表示用ビューモデル
   * @returns {string} HTML文字列
   */
  static render(viewModel) {
    if (!viewModel) return '';

    const category = viewModel.category || 'RUNTIME';
    
    // カテゴリ別の配色（バッジ）をマッピング
    const badgeClass = `knowledge-badge-${category.toLowerCase()}`;
    const newClass = viewModel.isNew ? 'knowledge-item-new' : '';

    return `
      <div class="knowledge-item ${newClass}" data-knowledge-id="${viewModel.knowledgeId}">
        <div class="knowledge-item-header">
          <span class="knowledge-category ${badgeClass}">${category}</span>
          <span class="knowledge-title-text">${viewModel.title}</span>
        </div>
        <div class="knowledge-item-meta">
          <span class="knowledge-meta-count">${viewModel.eventCount} Events</span>
          <span class="knowledge-meta-time">${viewModel.timeLabel}</span>
          <span class="knowledge-meta-source">Src: ${viewModel.sourceLabel}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.EventKnowledgeItem = EventKnowledgeItem;
