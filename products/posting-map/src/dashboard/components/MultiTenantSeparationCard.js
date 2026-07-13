/**
 * MultiTenantSeparationCard.js
 * 
 * 登録されている複数テナントのデータ隔離状態 (境界情報、イベント数、階層数) を客観的に可視化する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MultiTenantSeparationCard {
  /**
   * テナント隔離境界カードをレンダリングする
   * @param {object} props { tenants, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const tenants = props.tenants || [];
    const delay = props.delay || 0;

    const itemsHtml = tenants.map((tenant, idx) => {
      const typeLabel = tenant.tenantType === 'political' ? 'POLITICAL' : 'ENTERPRISE';
      const badgeClass = tenant.tenantType === 'political' ? 'badge-active' : 'badge-idle';
      
      return `
        <div class="tenant-row premium-glass" data-motion="fade-up" data-delay="${delay + (idx * 50)}">
          <div class="tenant-meta-wrap">
            <span class="tenant-id font-mono">${tenant.tenantId}</span>
            <span class="tenant-type-badge ${badgeClass}">${typeLabel}</span>
          </div>
          <div class="tenant-detail-grid">
            <div class="tenant-detail-item">
              <span class="detail-label">Name</span>
              <span class="detail-value">${tenant.tenantName}</span>
            </div>
            <div class="tenant-detail-item">
              <span class="detail-label">Regions</span>
              <span class="detail-value font-mono">${tenant.regionCount}</span>
            </div>
            <div class="tenant-detail-item">
              <span class="detail-label">Areas</span>
              <span class="detail-value font-mono">${tenant.areaCount}</span>
            </div>
            <div class="tenant-detail-item">
              <span class="detail-label">Events Received</span>
              <span class="detail-value font-mono text-glow-blue">${tenant.eventCount}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <section class="multi-tenant-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Tenant Separation Boundary</h2>
          <span class="card-subtitle">Active Data Boundary Isolation Monitor</span>
        </div>
        <div class="multi-tenant-body">
          ${itemsHtml.length > 0 ? itemsHtml : '<div class="no-tenants">No registered tenants found.</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.MultiTenantSeparationCard = MultiTenantSeparationCard;
