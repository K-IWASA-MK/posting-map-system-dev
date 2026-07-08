/**
 * TenantDrilldownCard.js
 * 
 * アクティブなテナント（Tenant）のメタデータと、配下にある
 * Region数、Area数、および蓄積イベント件数を俯瞰・観測する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class TenantDrilldownCard {
  /**
   * テナントドリルダウンカードをレンダリングする
   * @param {object} props { summary, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const summary = props.summary || { tenantId: "DEFAULT", tenantType: "default", regionCount: 0, areaCount: 0, eventCount: 0 };
    const delay = props.delay || 0;

    return `
      <section class="tenant-intelligence-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Tenant Intelligence Overview</h2>
          <span class="card-subtitle">Active Context: <strong class="text-glow-blue">${summary.tenantId}</strong></span>
        </div>
        <div class="drilldown-grid">
          <div class="drilldown-item">
            <span class="drilldown-label">Tenant ID</span>
            <span class="drilldown-value font-mono text-glow-blue">${summary.tenantId}</span>
          </div>
          <div class="drilldown-item">
            <span class="drilldown-label">Tenant Type</span>
            <span class="drilldown-value font-mono">${summary.tenantType.toUpperCase()}</span>
          </div>
          <div class="drilldown-item">
            <span class="drilldown-label">Region Nodes</span>
            <span class="drilldown-value font-mono">${summary.regionCount}</span>
          </div>
          <div class="drilldown-item">
            <span class="drilldown-label">Area Nodes</span>
            <span class="drilldown-value font-mono">${summary.areaCount}</span>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.TenantDrilldownCard = TenantDrilldownCard;
