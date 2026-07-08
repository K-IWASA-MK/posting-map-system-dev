/**
 * EventInsightCard.js
 * 
 * 構造化された統計インサイトオブジェクト一覧を表示する premium-glass カードコンポーネント。
 * 
 * 警告：本ファイル内への推論判定、自動対応、および button 等の操作用要素の実装は厳禁である。
 */

class EventInsightCard {
  /**
   * インサイトデータリストから HTML 文字列を出力する
   * @param {object} props 
   * @param {Array} props.insights インサイトリスト
   * @param {number} props.delay 遅延時間
   * @returns {string} HTML文字列
   */
  static render(props) {
    const insights = props.insights || [];
    const delay = props.delay || 0;

    let itemsHtml = '';

    insights.forEach(ins => {
      if (window.DashboardInsightAdapter && window.EventInsightItem) {
        const vm = window.DashboardInsightAdapter.adapt(ins);
        vm.isNew = true;
        itemsHtml += window.EventInsightItem.render(vm);
      }
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Insight Layer" data-motion="fade-up" data-delay="${delay}">
        <div class="insight-header-wrap">
          <h2>Event Insight Layer</h2>
        </div>
        <div class="insight-container">
          ${itemsHtml || '<p class="insight-empty">No insight items generated.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventInsightCard = EventInsightCard;
