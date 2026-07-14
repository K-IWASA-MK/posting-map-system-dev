/**
 * MultiTenantExecutiveCard.js
 * 
 * 複数テナントを横断集計したグローバルサマリーメトリクス (テナント数、地域数、エリア数、イベント受信件数、ガバナンススコア)
 * をマクロ視点で一覧表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MultiTenantExecutiveCard {
  /**
   * グローバル集計オーバービューカードをレンダリングする
   * @param {object} props { summary, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const data = props.summary || { totalTenants: 0, totalRegions: 0, totalAreas: 0, totalEvents: 0, trustScore: 100 };
    const delay = props.delay || 0;

    return `
      <section class="multi-tenant-executive-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">AIOS Global Overview</h2>
          <span class="card-subtitle">Macro-Level Aggregated Operations Status</span>
        </div>
        <div class="global-metrics-grid">
          <div class="global-metric-item">
            <span class="metric-label">Tenants</span>
            <span class="metric-value text-glow-blue">${data.totalTenants}</span>
          </div>
          <div class="global-metric-item">
            <span class="metric-label">Regions</span>
            <span class="metric-value font-mono">${data.totalRegions}</span>
          </div>
          <div class="global-metric-item">
            <span class="metric-label">Areas</span>
            <span class="metric-value font-mono">${data.totalAreas}</span>
          </div>
          <div class="global-metric-item">
            <span class="metric-label">Events</span>
            <span class="metric-value font-mono">${data.totalEvents}</span>
          </div>
          <div class="global-metric-item">
            <span class="metric-label">Trust Score</span>
            <span class="metric-value font-mono text-glow-green">${data.trustScore}%</span>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.MultiTenantExecutiveCard = MultiTenantExecutiveCard;
