/**
 * EventPatternItem.js
 * 
 * 単一の繰り返しパターン（Signature / Frequency）を表示するためのサブコンポーネント。
 */

class EventPatternItem {
  /**
   * パターンのビューモデルから HTML を生成する
   * @param {object} viewModel 表示用ビューモデル
   * @returns {string} HTML文字列
   */
  static render(viewModel) {
    if (!viewModel) return '';

    const category = viewModel.category || 'RUNTIME';
    
    // カテゴリ別の配色（バッジ）をマッピング
    const badgeClass = `pattern-badge-${category.toLowerCase()}`;
    const newClass = viewModel.isNew ? 'pattern-item-new' : '';

    return `
      <div class="pattern-item ${newClass}" data-pattern-id="${viewModel.patternId}">
        <div class="pattern-item-header">
          <span class="pattern-category ${badgeClass}">${category}</span>
          <span class="pattern-item-title">${viewModel.patternName}</span>
        </div>
        <div class="pattern-item-meta">
          <span class="pattern-meta-frequency">${viewModel.frequencyText}</span>
          <span class="pattern-meta-time">Last: ${viewModel.lastObservedText}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.EventPatternItem = EventPatternItem;
