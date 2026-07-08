/**
 * EventInsightItem.js
 * 
 * 単一のインサイト情報項目を表示するためのサブコンポーネント。
 */

class EventInsightItem {
  /**
   * インサイトのビューモデルから HTML を生成する
   * @param {object} viewModel 表示用ビューモデル
   * @returns {string} HTML文字列
   */
  static render(viewModel) {
    if (!viewModel) return '';

    const category = viewModel.category || 'RUNTIME';
    
    // カテゴリ別の配色（バッジ）をマッピング
    const badgeClass = `insight-badge-${category.toLowerCase()}`;
    const newClass = viewModel.isNew ? 'insight-item-new' : '';

    return `
      <div class="insight-item ${newClass}" data-insight-id="${viewModel.insightId}">
        <div class="insight-item-header">
          <span class="insight-category ${badgeClass}">${category}</span>
          <span class="insight-summary-text">${viewModel.title}</span>
        </div>
        <div class="insight-item-meta">
          <span class="insight-meta-trend">${viewModel.trendSummary}</span>
          <span class="insight-meta-time">${viewModel.timeRange}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.EventInsightItem = EventInsightItem;
