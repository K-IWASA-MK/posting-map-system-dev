/**
 * EventMemoryCard.js
 * 
 * 長期履歴スナップショットアーカイブおよび保持状況（Retention Indicator）を表示する premium-glass カードコンポーネント。
 * 
 * 警告：本ファイル内への推論判定、自動対応、自己改善、および button 等の操作用要素の実装は厳禁である。
 */

class EventMemoryCard {
  /**
   * メモリデータリストから HTML 文字列を出力する
   * @param {object} props 
   * @param {Array} props.memories メモリリスト
   * @param {number} props.delay 遅延時間
   * @returns {string} HTML文字列
   */
  static render(props) {
    const memories = props.memories || [];
    const delay = props.delay || 0;
    const capacity = 1000;
    const currentCount = memories.length;
    const usagePercent = Math.min(100, Math.round((currentCount / capacity) * 100));

    let itemsHtml = '';

    memories.forEach(mem => {
      if (window.DashboardMemoryAdapter && window.EventMemoryItem) {
        const vm = window.DashboardMemoryAdapter.adapt(mem);
        vm.isNew = true;
        itemsHtml += window.EventMemoryItem.render(vm);
      }
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Memory Layer" data-motion="fade-up" data-delay="${delay}">
        <div class="memory-header-wrap">
          <h2>Event Memory Layer</h2>
          <div class="memory-retention-wrap">
            <span class="memory-retention-label">Retention Usage: ${currentCount}/${capacity} (${usagePercent}%)</span>
            <div class="memory-retention-bar-bg">
              <div class="memory-retention-bar-fill" style="width: ${usagePercent}%"></div>
            </div>
          </div>
        </div>
        <div class="memory-container">
          ${itemsHtml || '<p class="memory-empty">No historical snapshots archived.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventMemoryCard = EventMemoryCard;
