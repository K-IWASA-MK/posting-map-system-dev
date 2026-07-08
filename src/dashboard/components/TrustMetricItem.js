/**
 * TrustMetricItem.js
 * 
 * ガバナンス規約チェックの個別メトリクス詳細を行表示するサブコンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class TrustMetricItem {
  static render(record) {
    const status = record.status || 'PASS';
    const score = record.score !== undefined ? record.score : 100;
    const name = record.metricName || '';
    const details = record.details || '';

    let statusClass = 'audit-pass';
    if (status === 'NOTICE') statusClass = 'audit-notice';
    else if (status === 'FAIL') statusClass = 'audit-fail';

    return `
      <div class="trust-metric-row premium-glass-border">
        <div class="metric-row-header">
          <span class="metric-row-title">${name}</span>
          <span class="metric-row-badge ${statusClass}">${status}</span>
        </div>
        <div class="metric-row-body">
          <div class="metric-row-score-wrap">
            <span class="metric-row-label">Score</span>
            <span class="metric-row-value">${score} / 100</span>
          </div>
          <p class="metric-row-details">${details}</p>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.TrustMetricItem = TrustMetricItem;
