/**
 * MultiTenantExecutiveAdapter.js
 * 
 * テナントレジストリストア、階層ストア、タイムラインストア、および
 * ガバナンスアダプターからデータを安全に読み込み、
 * 複数テナント全体のグローバルサマリーメトリクス（総テナント数、地域数、エリア数、イベント数、信頼スコア）
 * を集約・算出するビューモデルアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class MultiTenantExecutiveAdapter {
  /**
   * 複数テナント横断のマクロ集約データを算出する
   * @returns {object} Immutable Aggregation Summary Object
   */
  static getMultiTenantExecutiveData() {
    const registryStore = window.DashboardTenantRegistryStore;
    const hierarchyStore = window.DashboardTenantHierarchyStore;
    const timelineStore = window.DashboardEventTimelineStore;
    const trustAdapter = window.TrustGovernanceAdapter;

    const tenants = registryStore ? registryStore.getTenants() : [];
    const timeline = timelineStore ? timelineStore.getTimeline() : [];

    let totalRegions = 0;
    let totalAreas = 0;

    // 各テナントの階層データを横断集計
    tenants.forEach(tenant => {
      if (hierarchyStore) {
        const hierarchyData = hierarchyStore.getHierarchy(tenant.tenantId);
        if (hierarchyData && hierarchyData.hierarchy && hierarchyData.hierarchy.regions) {
          const regions = hierarchyData.hierarchy.regions;
          totalRegions += regions.length;
          totalAreas += regions.reduce((acc, r) => acc + (r.areas ? r.areas.length : 0), 0);
        }
      }
    });

    const totalEvents = timeline.length;

    // Trust Governance Adapter は score のみを参照し、密結合を防止する
    let trustScore = 100;
    if (trustAdapter && typeof trustAdapter.getGovernanceData === 'function') {
      const trustData = trustAdapter.getGovernanceData();
      if (trustData && typeof trustData.complianceScore === 'number') {
        trustScore = trustData.complianceScore;
      }
    }

    return Object.freeze({
      totalTenants: tenants.length,
      totalRegions,
      totalAreas,
      totalEvents,
      trustScore
    });
  }
}

// グローバル公開
window.MultiTenantExecutiveAdapter = MultiTenantExecutiveAdapter;
