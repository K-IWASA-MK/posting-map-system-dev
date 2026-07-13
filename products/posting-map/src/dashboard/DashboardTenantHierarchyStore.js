/**
 * DashboardTenantHierarchyStore.js
 * 
 * Tenant ➔ Region ➔ Area の階層定義を Immutable に管理するデータストア。
 * 特定自治体名や政治支部に依存したハードコーディングロジックは一切含まず、汎用データモデルとして動作する。
 * 
 * 警告：本ファイル内への API 通信、書き込み処理、および AI 推論ロジックの追加は厳禁である。
 */

class DashboardTenantHierarchyStore {
  // デモ検証用およびデフォルト定義の汎用階層データ (データ駆動設計)
  static hierarchies = {
    "MIE-03": Object.freeze({
      tenantId: "MIE-03",
      tenantType: "political",
      hierarchy: Object.freeze({
        regions: [
          Object.freeze({
            regionId: "REGION-001",
            regionName: "Sample Region 1",
            regionType: "branch",
            areas: [
              Object.freeze({ areaId: "AREA-001", areaName: "Sample Area A", areaType: "zone" }),
              Object.freeze({ areaId: "AREA-002", areaName: "Sample Area B", areaType: "zone" })
            ]
          }),
          Object.freeze({
            regionId: "REGION-002",
            regionName: "Sample Region 2",
            regionType: "branch",
            areas: [
              Object.freeze({ areaId: "AREA-003", areaName: "Sample Area C", areaType: "zone" })
            ]
          })
        ]
      })
    }),
    "DEFAULT": Object.freeze({
      tenantId: "DEFAULT",
      tenantType: "organization",
      hierarchy: Object.freeze({
        regions: [
          Object.freeze({
            regionId: "DEFAULT",
            regionName: "Default Region",
            regionType: "branch",
            areas: [
              Object.freeze({ areaId: "DEFAULT", areaName: "Default Area", areaType: "zone" })
            ]
          })
        ]
      })
    })
  };

  /**
   * 指定されたテナントの階層構造を取得する
   * @param {string} tenantId 
   * @returns {object} Immutable Hierarchy Object
   */
  static getHierarchy(tenantId) {
    const tid = tenantId || "DEFAULT";
    const hierarchy = this.hierarchies[tid] || this.hierarchies["DEFAULT"];
    return hierarchy;
  }
}

// グローバル公開
window.DashboardTenantHierarchyStore = DashboardTenantHierarchyStore;
