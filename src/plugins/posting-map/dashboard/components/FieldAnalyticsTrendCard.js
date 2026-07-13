/**
 * FieldAnalyticsTrendCard.js
 * 
 * 日別イベント数、前日比較、平均カバー率などの時系列推移データを
 * 美しい数値パネルと事実リストで Read-Only 可視化する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class FieldAnalyticsTrendCard {
  /**
   * 現場分析トレンドカードをレンダリングする
   * @param {object} props { trendData, averageCoverage, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const trend = props.trendData || { todayEvents: 0, yesterdayEvents: 0, dodChange: 0, dailyTrend: {}, monthlyTrend: {} };
    const avgCoverage = props.averageCoverage || 0;
    const delay = props.delay || 0;

    const changeClass = trend.dodChange >= 0 ? 'text-glow-green' : 'text-glow-red';
    const changeSymbol = trend.dodChange >= 0 ? '+' : '';

    const dailyRows = Object.keys(trend.dailyTrend).sort().reverse().slice(0, 5).map(date => `
      <div class="trend-row-item">
        <span class="trend-date font-mono">${date}</span>
        <span class="trend-count font-mono">${trend.dailyTrend[date]} events</span>
      </div>
    `).join('');

    return `
      <section class="field-analytics-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Operational Activity Trends</h2>
          <span class="card-subtitle">Daily Events Stream & Historical Analytics</span>
        </div>
        <div class="analytics-metrics-grid">
          <div class="analytics-metric-item">
            <span class="metric-lbl">Avg Coverage</span>
            <span class="metric-val text-glow-blue font-mono">${avgCoverage}%</span>
          </div>
          <div class="analytics-metric-item">
            <span class="metric-lbl">Today's Stream</span>
            <span class="metric-val font-mono">${trend.todayEvents}</span>
          </div>
          <div class="analytics-metric-item">
            <span class="metric-lbl">Day-over-Day</span>
            <span class="metric-val font-mono ${changeClass}">${changeSymbol}${trend.dodChange}%</span>
          </div>
        </div>
        <div class="trend-section">
          <h3 class="trend-section-title">Recent Activity Logs</h3>
          <div class="trend-list-container">
            ${dailyRows || '<div class="no-data">No Recent Activity Logged</div>'}
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FieldAnalyticsTrendCard = FieldAnalyticsTrendCard;
