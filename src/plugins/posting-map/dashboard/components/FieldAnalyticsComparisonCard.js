/**
 * FieldAnalyticsComparisonCard.js
 * 
 * エリア別の活動イベント件数の比較、および
 * テナント全体のカバー率 (Coverage) 履歴を客観的に一覧表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class FieldAnalyticsComparisonCard {
  /**
   * 現場分析比較カードをレンダリングする
   * @param {object} props { areaComparison, coverageHistory, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const areas = props.areaComparison || [];
    const history = props.coverageHistory || [];
    const delay = props.delay || 0;

    let areaRows = '';
    if (areas.length === 0) {
      areaRows = `<div class="no-nodes">No Activity Comparison Available</div>`;
    } else {
      areaRows = areas.map(a => `
        <div class="comparison-row-item">
          <span class="comparison-id text-glow-blue font-mono">${a.areaId}</span>
          <span class="comparison-count font-mono">${a.fieldEventsCount} events</span>
          <span class="comparison-rate font-mono">${a.coverageRate}%</span>
        </div>
      `).join('');
    }

    const historyRows = history.map(h => `
      <div class="history-row-item">
        <span class="history-lbl">${h.timestamp}</span>
        <span class="history-val font-mono">${h.coverageRate}%</span>
      </div>
    `).join('');

    return `
      <section class="field-analytics-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Comparative Area Metrics</h2>
          <span class="card-subtitle">Comparing Operational Load & Historical Progression</span>
        </div>
        <div class="comparison-section">
          <h3 class="trend-section-title">Area Activity Load</h3>
          <div class="comparison-list-container">
            ${areaRows}
          </div>
        </div>
        <div class="comparison-section" style="margin-top: var(--space-md);">
          <h3 class="trend-section-title">Coverage Progress History</h3>
          <div class="history-list-container">
            ${historyRows}
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FieldAnalyticsComparisonCard = FieldAnalyticsComparisonCard;
