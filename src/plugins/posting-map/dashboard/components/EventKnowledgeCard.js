/**
 * EventKnowledgeCard.js
 * 
 * 構造化された観測知識オブジェクト一覧を表示する premium-glass カードコンポーネント。
 * 
 * 警告：本ファイル内への推論判定、自動対応、および button 等の操作用要素の実装は厳禁である。
 */

class EventKnowledgeCard {
  /**
   * ナレッジデータリストから HTML 文字列を出力する
   * @param {object} props 
   * @param {Array} props.knowledges ナレッジリスト
   * @param {number} props.delay 遅延時間
   * @returns {string} HTML文字列
   */
  static render(props) {
    const knowledges = props.knowledges || [];
    const delay = props.delay || 0;

    let itemsHtml = '';

    knowledges.forEach(k => {
      if (window.DashboardKnowledgeAdapter && window.EventKnowledgeItem) {
        const vm = window.DashboardKnowledgeAdapter.adapt(k);
        // 新着簡易判定
        vm.isNew = true;
        itemsHtml += window.EventKnowledgeItem.render(vm);
      }
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Knowledge Layer" data-motion="fade-up" data-delay="${delay}">
        <div class="knowledge-header-wrap">
          <h2>Event Knowledge Layer</h2>
          <div class="knowledge-anchor-links">
            <span class="knowledge-anchor timeline-anchor" title="Linked to Event Timeline">🔍 Timeline Link</span>
            <span class="knowledge-anchor graph-anchor" title="Linked to Topology Graph">🔍 Graph Link</span>
          </div>
        </div>
        <div class="knowledge-container">
          ${itemsHtml || '<p class="knowledge-empty">No knowledge items generated.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventKnowledgeCard = EventKnowledgeCard;
