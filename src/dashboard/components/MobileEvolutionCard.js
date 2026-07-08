/**
 * MobileEvolutionCard.js
 * 
 * スマホでの視認性を考慮し、ADD/MODIFY/REMOVE 変化量を
 * コンパクトな横帯デザインで表示する構造進化ステータスカード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MobileEvolutionCard {
  /**
   * 構造変化ステータスカードを描画する
   */
  static render(props) {
    const status = props.evolutionStatus || { add: 0, modify: 0, remove: 0 };
    const delay = props.delay || 0;

    const total = status.add + status.modify + status.remove;

    return `
      <section class="card premium-glass" aria-label="Mobile Evolution Status" data-motion="fade-up" data-delay="${delay}">
        <h2>Evolution Status</h2>
        <div class="mobile-evo-container">
          <div class="mobile-evo-row">
            <span class="m-evo-badge m-evo-add">ADD: ${status.add.toLocaleString()}</span>
            <span class="m-evo-badge m-evo-modify">MODIFY: ${status.modify.toLocaleString()}</span>
            <span class="m-evo-badge m-evo-remove">REMOVE: ${status.remove.toLocaleString()}</span>
          </div>
          
          <div class="mobile-evo-total-box">
            <div class="mobile-evo-total-lbl">Total Pipeline Mutations</div>
            <div class="mobile-evo-total-val">${total.toLocaleString()}</div>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.MobileEvolutionCard = MobileEvolutionCard;
