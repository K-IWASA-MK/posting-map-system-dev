/**
 * HierarchyContextCard.js
 * 
 * 現在観測対象となっているデータ階層境界 (Tenant ➔ Region ➔ Area) を可視化する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class HierarchyContextCard {
  /**
   * 階層表示カードをレンダリングする
   * @param {object} props { hierarchyContext, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const context = props.hierarchyContext || { tenantId: 'DEFAULT', regionId: 'DEFAULT', areaId: 'DEFAULT' };
    const delay = props.delay || 0;

    // 階層データに対応する表示名を DashboardTenantHierarchyStore から動的に取得
    const store = window.DashboardTenantHierarchyStore;
    const hierarchyData = store ? store.getHierarchy(context.tenantId) : null;
    
    let regionName = "Default Region";
    let areaName = "Default Area";

    if (hierarchyData && hierarchyData.hierarchy && hierarchyData.hierarchy.regions) {
      const regionObj = hierarchyData.hierarchy.regions.find(r => r.regionId === context.regionId);
      if (regionObj) {
        regionName = regionObj.regionName;
        const areaObj = regionObj.areas.find(a => a.areaId === context.areaId);
        if (areaObj) {
          areaName = areaObj.areaName;
        }
      }
    }

    return `
      <section class="hierarchy-context-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="hierarchy-header-wrap">
          <div class="hierarchy-title-group">
            <h2 class="card-title">Tenant Hierarchy Context</h2>
            <span class="card-subtitle">Operational Boundary Data Context</span>
          </div>
        </div>
        <div class="hierarchy-body">
          <div class="hierarchy-badge-flow">
            <div class="hierarchy-badge-item">
              <span class="badge-lbl">Tenant</span>
              <span class="badge-val font-mono">${context.tenantId}</span>
            </div>
            <div class="hierarchy-arrow">➔</div>
            <div class="hierarchy-badge-item">
              <span class="badge-lbl">Region</span>
              <span class="badge-val">${regionName}</span>
            </div>
            <div class="hierarchy-arrow">➔</div>
            <div class="hierarchy-badge-item">
              <span class="badge-lbl">Area</span>
              <span class="badge-val">${areaName}</span>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.HierarchyContextCard = HierarchyContextCard;
