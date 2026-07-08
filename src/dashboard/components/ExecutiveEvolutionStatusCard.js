/**
 * ExecutiveEvolutionStatusCard.js
 * 
 * ADD / MODIFY / REMOVE などの構造変化統計および
 * パイプライン内の構造進化レベルを描画するカード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class ExecutiveEvolutionStatusCard {
  /**
   * 構造変化ステータスカードを描画する
   */
  static render(props) {
    const status = props.evolutionStatus || { add: 0, modify: 0, remove: 0 };
    const delay = props.delay || 0;

    const total = status.add + status.modify + status.remove;

    return `
      <section class="card premium-glass" aria-label="Executive Evolution Status" data-motion="fade-up" data-delay="${delay}">
        <h2>Evolution Status</h2>
        <div class="executive-evo-container">
          <div class="evo-stat-row">
            <span class="evo-stat-badge evo-badge-add">ADD</span>
            <span class="evo-stat-val">${status.add.toLocaleString()}</span>
          </div>
          <div class="evo-stat-row">
            <span class="evo-stat-badge evo-badge-modify">MODIFY</span>
            <span class="evo-stat-val">${status.modify.toLocaleString()}</span>
          </div>
          <div class="evo-stat-row">
            <span class="evo-stat-badge evo-badge-remove">REMOVE</span>
            <span class="evo-stat-val">${status.remove.toLocaleString()}</span>
          </div>
          
          <div class="evo-total-wrap">
            <div class="evo-total-label">Total Pipeline Mutations</div>
            <div class="evo-total-value">${total.toLocaleString()}</div>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.ExecutiveEvolutionStatusCard = ExecutiveEvolutionStatusCard;
