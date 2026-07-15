/**
 * DashboardTenantRegistryStore.js
 * 
 * 観測対象となるテナント定義 (Tenant Registry) を管理するデータストア。
 * 特定の政治支部名などに依存したハードコーディングロジックを排除し、汎用データモデルとして動作する。
 * 
 * 警告：本ファイル内への API 通信、書き込み処理、および AI 推論ロジックの追加は厳禁である。
 */

class DashboardTenantRegistryStore {
  // 登録されている観測対象テナント定義の一覧 (データ駆動)
  static registry = Object.freeze([
    Object.freeze({
      tenantId: "MIE-03",
      tenantName: "Sample Tenant A (MIE-03)",
      tenantType: "political"
    }),
    Object.freeze({
      tenantId: "TENANT-002",
      tenantName: "Sample Tenant B (TENANT-002)",
      tenantType: "enterprise"
    })
  ]);

  /**
   * 登録された全テナント一覧を取得する
   * @returns {array} Immutable list of registered tenants
   */
  static getTenants() {
    return this.registry;
  }
}

// グローバル公開
window.DashboardTenantRegistryStore = DashboardTenantRegistryStore;
