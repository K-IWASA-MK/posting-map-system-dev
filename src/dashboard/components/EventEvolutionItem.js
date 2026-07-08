/**
 * EventEvolutionItem.js
 * 
 * 単一の構造変化差分（Before / After）を表示するためのサブコンポーネント。
 */

class EventEvolutionItem {
  /**
   * エボリューションのビューモデルから HTML を生成する
   * @param {object} viewModel 表示用ビューモデル
   * @returns {string} HTML文字列
   */
  static render(viewModel) {
    if (!viewModel) return '';

    const changeType = viewModel.changeType || 'MODIFY';
    
    // 変化タイプ別のバッジ配色をマッピング
    const badgeClass = `evolution-badge-${changeType.toLowerCase()}`;
    const newClass = viewModel.isNew ? 'evolution-item-new' : '';

    return `
      <div class="evolution-item ${newClass}" data-evolution-id="${viewModel.evolutionId}">
        <div class="evolution-item-header">
          <span class="evolution-change-badge ${badgeClass}">${changeType}</span>
          <span class="evolution-item-title">${viewModel.title}</span>
        </div>
        <div class="evolution-diff-grid">
          <div class="evolution-diff-side">
            <span class="evolution-diff-label">Before:</span>
            <div class="evolution-diff-content font-mono">${viewModel.beforeText}</div>
          </div>
          <div class="evolution-diff-side">
            <span class="evolution-diff-label">After:</span>
            <div class="evolution-diff-content font-mono">${viewModel.afterText}</div>
          </div>
        </div>
        <div class="evolution-item-meta">
          <span class="evolution-meta-time">${viewModel.timeRange}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.EventEvolutionItem = EventEvolutionItem;
