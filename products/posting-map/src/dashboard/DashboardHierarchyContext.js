/**
 * DashboardHierarchyContext.js
 * 
 * 現在観測対象となる階層コンテキスト (Tenant Context, Region Context, Area Context) を保持するシングルトン。
 * 
 * 警告：本ファイル内への UI 切替・選択操作ロジック、および認証・認可機能の追加は厳禁である。
 */

class DashboardHierarchyContext {
  // 初期観測対象階層の定義 (MIE-03 ➔ REGION-001 ➔ AREA-001)
  static context = Object.freeze({
    tenantId: "MIE-03",
    regionId: "REGION-001",
    areaId: "AREA-001"
  });

  /**
   * 現在観測対象となる階層コンテキストを取得する
   * @returns {object} Immutable Hierarchy Context
   */
  static getContext() {
    return this.context;
  }
}

// グローバル公開
window.DashboardHierarchyContext = DashboardHierarchyContext;
