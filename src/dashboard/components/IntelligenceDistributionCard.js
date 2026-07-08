/**
 * IntelligenceDistributionCard.js
 * 
 * Runtime / Governance / Quality / Trust / Simulation などの
 * 監視カテゴリシェア比率を美しいプログレスメーターで描画するカード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class IntelligenceDistributionCard {
  /**
   * 分布カードを描画する
   */
  static render(props) {
    const dist = props.distribution || { runtime: 0, governance: 0, quality: 0, trust: 0, simulation: 0 };
    const delay = props.delay || 0;

    const items = [
      { key: 'runtime', label: 'Runtime System', value: dist.runtime, color: '#3b82f6' },
      { key: 'governance', label: 'Governance Policies', value: dist.governance, color: '#a855f7' },
      { key: 'quality', label: 'Quality Verification', value: dist.quality, color: '#10b981' },
      { key: 'trust', label: 'Trust & Safety', value: dist.trust, color: '#f59e0b' },
      { key: 'simulation', label: 'Simulation Tests', value: dist.simulation, color: '#ec4899' }
    ];

    let metersHtml = '';
    items.forEach(item => {
      metersHtml += `
        <div class="dist-row">
          <div class="dist-label-wrap">
            <span class="dist-dot" style="background-color: ${item.color};"></span>
            <span class="dist-label">${item.label}</span>
            <span class="dist-val">${item.value}%</span>
          </div>
          <div class="dist-bar-bg">
            <div class="dist-bar-fill" style="width: ${item.value}%; background-color: ${item.color};"></div>
          </div>
        </div>
      `;
    });

    return `
      <section class="card premium-glass" aria-label="Intelligence Share Distribution" data-motion="fade-up" data-delay="${delay}">
        <h2>Pipeline Category Share</h2>
        <div class="dist-container">
          ${metersHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.IntelligenceDistributionCard = IntelligenceDistributionCard;
