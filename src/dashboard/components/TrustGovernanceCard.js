/**
 * TrustGovernanceCard.js
 * 
 * ガバナンス順守状態（Compliance Score、チェック項目一覧）を表示するメインコンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class TrustGovernanceCard {
  static render(props) {
    const data = props.data || { complianceScore: 100, status: 'PASS', records: [] };
    const delay = props.delay || 0;

    let scoreClass = 'score-high';
    if (data.complianceScore < 60) scoreClass = 'score-low';
    else if (data.complianceScore < 95) scoreClass = 'score-medium';

    let statusClass = 'audit-pass';
    if (data.status === 'NOTICE') statusClass = 'audit-notice';
    else if (data.status === 'FAIL') statusClass = 'audit-fail';

    // 項目リストのレンダリング
    const itemsHtml = data.records.map(record => {
      return window.TrustMetricItem ? window.TrustMetricItem.render(record) : '';
    }).join('');

    return `
      <section class="trust-governance-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Governance Integrity Checks</h2>
          <span class="card-subtitle">Read Only Policy Auditing</span>
        </div>
        <div class="trust-summary-section">
          <div class="trust-score-gauge">
            <svg class="score-circle-svg" viewBox="0 0 100 100">
              <circle class="score-bg-circle" cx="50" cy="50" r="40"></circle>
              <circle class="score-progress-circle ${scoreClass}" cx="50" cy="50" r="40" 
                      style="stroke-dasharray: 251.2; stroke-dashoffset: ${251.2 - (251.2 * data.complianceScore) / 100};"></circle>
            </svg>
            <div class="score-text-wrap">
              <span class="compliance-score-val">${data.complianceScore}</span>
              <span class="compliance-score-label">Compliance Score</span>
            </div>
          </div>
          <div class="trust-status-indicator">
            <span class="indicator-label">Overall Status</span>
            <span class="indicator-value-badge ${statusClass}">${data.status}</span>
          </div>
        </div>
        <div class="trust-metrics-list">
          ${itemsHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.TrustGovernanceCard = TrustGovernanceCard;
