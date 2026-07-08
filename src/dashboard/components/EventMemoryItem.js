/**
 * EventMemoryItem.js
 * 
 * 単一の長期履歴スナップショット（Snapshot / Metadata）を表示するためのサブコンポーネント。
 */

class EventMemoryItem {
  /**
   * メモリのビューモデルから HTML を生成する
   * @param {object} viewModel 表示用ビューモデル
   * @returns {string} HTML文字列
   */
  static render(viewModel) {
    if (!viewModel) return '';

    const category = viewModel.category || 'RUNTIME';
    
    // カテゴリ別の配色（バッジ）をマッピング
    const badgeClass = `memory-badge-${category.toLowerCase()}`;
    const newClass = viewModel.isNew ? 'memory-item-new' : '';

    return `
      <div class="memory-item ${newClass}" data-memory-id="${viewModel.memoryId}">
        <div class="memory-item-header">
          <span class="memory-category ${badgeClass}">${category}</span>
          <span class="memory-item-title">${viewModel.saveState}</span>
        </div>
        <div class="memory-item-refs font-mono">${viewModel.referenceText}</div>
        <pre class="memory-item-snapshot font-mono">${viewModel.historicalDataText}</pre>
        <div class="memory-item-meta">
          <span class="memory-meta-time">${viewModel.timeText}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.EventMemoryItem = EventMemoryItem;
