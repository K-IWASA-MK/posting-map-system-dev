/**
 * FieldAuditAdapter.js
 * 
 * 監査ストアからデータを抽出し、アクティブなテナント境界で安全にフィルタリングして
 * 監査レコードの ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・判断ロジックの実装は厳禁である。
 */

class FieldAuditAdapter {
  /**
   * 現場監査画面用の ViewModel を取得する
   * @returns {object} Immutable Field Audit ViewModel
   */
  static getFieldAuditData() {
    const tenantCtx = window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : { tenantId: "DEFAULT" };
    const activeTenantId = tenantCtx.tenantId || "DEFAULT";

    const auditStore = window.DashboardFieldAuditStore;
    const rawAudit = auditStore ? auditStore.getAuditData() : [];

    // アクティブなテナントIDに一致するレコードのみを抽出
    const tenantAudit = rawAudit.filter(a => a.tenantId === activeTenantId);

    return Object.freeze({
      tenantId: activeTenantId,
      auditList: Object.freeze(tenantAudit.map(a => Object.freeze(a)))
    });
  }
}

// グローバル公開
window.FieldAuditAdapter = FieldAuditAdapter;
