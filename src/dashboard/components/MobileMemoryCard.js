/**
 * MobileMemoryCard.js
 * 
 * モバイル表示用に要素を極限までシンプルにまとめた、
 * パターン数および長期アーカイブメモリのリテンション概要表示カード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MobileMemoryCard {
  /**
   * メモリカードを描画する
   */
  static render(props) {
    const kpis = props.kpis || { patternCount: 0, memoryCapacity: 0, maxMemoryCapacity: 1000 };
    const delay = props.delay || 0;

    const utilization = Math.min(100, Math.round((kpis.memoryCapacity / kpis.maxMemoryCapacity) * 100));

    return `
      <section class="card premium-glass" aria-label="Mobile Pattern & Memory Summary" data-motion="fade-up" data-delay="${delay}">
        <h2>Pattern & Memory Archive</h2>
        <div class="mobile-summary-container">
          <div class="mobile-summary-row">
            <span class="m-summary-lbl">Identified Patterns</span>
            <span class="m-summary-val">${kpis.patternCount} Signatures</span>
          </div>
          
          <div class="mobile-summary-row">
            <span class="m-summary-lbl">Archive Retention</span>
            <span class="m-summary-val">${kpis.memoryCapacity} / ${kpis.maxMemoryCapacity} Recs</span>
          </div>

          <div class="mobile-retention-progress-wrap">
            <div class="mobile-retention-lbl-line">
              <span>Utilization</span>
              <span>${utilization}%</span>
            </div>
            <div class="mobile-retention-progress-bg">
              <div class="mobile-retention-progress-fill" style="width: ${utilization}%; background-color: #a855f7;"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.MobileMemoryCard = MobileMemoryCard;
