/**
 * DashboardTenantIntelligenceStore.js
 * 
 * テナント、地域 (Region)、エリア (Area) の親子関係と階層メタデータを
 * 不変オブジェクトとして保持・提供するストア。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class DashboardTenantIntelligenceStore {
  /**
   * 階層構造定義オブジェクトを取得する
   * @returns {object} Immutable Hierarchy Mapping Object
   */
  static getHierarchyMapping() {
    const defaultMapping = {
      "MIE-03": {
        regions: [
          {
            regionId: "REGION-001",
            regionType: "political_branch",
            areas: [
              { areaId: "AREA-001", areaType: "precinct" },
              { areaId: "AREA-002", areaType: "precinct" }
            ]
          },
          {
            regionId: "REGION-002",
            regionType: "political_branch",
            areas: [
              { areaId: "AREA-003", areaType: "precinct" }
            ]
          }
        ]
      },
      "TENANT-002": {
        regions: [
          {
            regionId: "DEFAULT",
            regionType: "default",
            areas: [
              { areaId: "DEFAULT", areaType: "default" }
            ]
          }
        ]
      }
    };
    return Object.freeze(defaultMapping);
  }
}

// グローバル公開
window.DashboardTenantIntelligenceStore = DashboardTenantIntelligenceStore;
