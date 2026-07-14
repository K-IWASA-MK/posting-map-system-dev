/**
 * EventPatternCard.js
 * 
 * 構造シグネチャによる繰り返しパターン一覧を表示する premium-glass カードコンポーネント。
 * 
 * 警告：本ファイル内への推論判定、AI学習、自動対応、および button 等の操作用要素の実装は厳禁である。
 */

class EventPatternCard {
  /**
   * パターンデータリストから HTML 文字列を出力する
   * @param {object} props 
   * @param {Array} props.patterns パターンリスト
   * @param {number} props.delay 遅延時間
   * @returns {string} HTML文字列
   */
  static render(props) {
    const patterns = props.patterns || [];
    const delay = props.delay || 0;

    let itemsHtml = '';

    patterns.forEach(pat => {
      if (window.DashboardPatternAdapter && window.EventPatternItem) {
        const vm = window.DashboardPatternAdapter.adapt(pat);
        vm.isNew = true;
        itemsHtml += window.EventPatternItem.render(vm);
      }
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Pattern Layer" data-motion="fade-up" data-delay="${delay}">
        <div class="pattern-header-wrap">
          <h2>Event Pattern Layer</h2>
        </div>
        <div class="pattern-container">
          ${itemsHtml || '<p class="pattern-empty">No recurrent patterns identified.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventPatternCard = EventPatternCard;
