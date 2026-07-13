/**
 * EventEvolutionCard.js
 * 
 * 構造変化差分一覧を表示する premium-glass カードコンポーネント。
 * 
 * 警告：本ファイル内への推論判定、自動対応、および button 等の操作用要素の実装は厳禁である。
 */

class EventEvolutionCard {
  /**
   * エボリューションデータリストから HTML 文字列を出力する
   * @param {object} props 
   * @param {Array} props.evolutions 差分リスト
   * @param {number} props.delay 遅延時間
   * @returns {string} HTML文字列
   */
  static render(props) {
    const evolutions = props.evolutions || [];
    const delay = props.delay || 0;

    let itemsHtml = '';

    evolutions.forEach(evo => {
      if (window.DashboardEvolutionAdapter && window.EventEvolutionItem) {
        const vm = window.DashboardEvolutionAdapter.adapt(evo);
        vm.isNew = true;
        itemsHtml += window.EventEvolutionItem.render(vm);
      }
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Evolution Layer" data-motion="fade-up" data-delay="${delay}">
        <div class="evolution-header-wrap">
          <h2>Event Evolution Layer</h2>
        </div>
        <div class="evolution-container">
          ${itemsHtml || '<p class="evolution-empty">No structural changes detected.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventEvolutionCard = EventEvolutionCard;
