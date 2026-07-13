/**
 * MultiTenantAdapter.js
 * 
 * 登録テナントストア、階層ストア、およびタイムラインストアのデータから、
 * 各テナントごとの Region 数、Area 数、受信イベント件数を集約し、
 * ダッシュボード表示用のビューモデルへと加工・返却するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class MultiTenantAdapter {
  /**
   * 各テナント境界の観測サマリーデータを集計・取得する
   * @returns {object} Immutable Multi-Tenant Summary Object
   */
  static getMultiTenantData() {
    const registryStore = window.DashboardTenantRegistryStore;
    const hierarchyStore = window.DashboardTenantHierarchyStore;
    const timelineStore = window.DashboardEventTimelineStore;

    const tenants = registryStore ? registryStore.getTenants() : [];
    const timeline = timelineStore ? timelineStore.getTimeline() : [];

    const summaryList = tenants.map(tenant => {
      let regionCount = 0;
      let areaCount = 0;

      // 階層情報の取得とカウント
      if (hierarchyStore) {
        const hierarchyData = hierarchyStore.getHierarchy(tenant.tenantId);
        if (hierarchyData && hierarchyData.hierarchy && hierarchyData.hierarchy.regions) {
          const regions = hierarchyData.hierarchy.regions;
          regionCount = regions.length;
          // 各 Region に属する Area 数を合算
          areaCount = regions.reduce((acc, r) => acc + (r.areas ? r.areas.length : 0), 0);
        }
      }

      // タイムラインイベントのテナントデータ境界カウント
      const eventCount = timeline.filter(evt => evt.tenantId === tenant.tenantId).length;

      return Object.freeze({
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        tenantType: tenant.tenantType,
        regionCount,
        areaCount,
        eventCount
      });
    });

    return Object.freeze({
      tenants: Object.freeze(summaryList)
    });
  }
}

// グローバル公開
window.MultiTenantAdapter = MultiTenantAdapter;
