/**
 * FieldEvidenceAdapter.js
 * 
 * 証跡ストアからデータを抽出し、アクティブなテナント境界で安全にフィルタリングして
 * 証跡レコードの ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論ロジックの実装は厳禁である。
 */

class FieldEvidenceAdapter {
  /**
   * 現場証跡画面用の ViewModel を取得する
   * @returns {object} Immutable Field Evidence ViewModel
   */
  static getFieldEvidenceData() {
    const tenantCtx = window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : { tenantId: "DEFAULT" };
    const activeTenantId = tenantCtx.tenantId || "DEFAULT";

    const evidenceStore = window.DashboardFieldEvidenceStore;
    const rawEvidence = evidenceStore ? evidenceStore.getEvidenceData() : [];

    // アクティブなテナントIDに一致するレコードのみを抽出
    const tenantEvidence = rawEvidence.filter(e => e.tenantId === activeTenantId);

    return Object.freeze({
      tenantId: activeTenantId,
      evidenceList: Object.freeze(tenantEvidence.map(e => Object.freeze(e)))
    });
  }
}

// グローバル公開
window.FieldEvidenceAdapter = FieldEvidenceAdapter;
