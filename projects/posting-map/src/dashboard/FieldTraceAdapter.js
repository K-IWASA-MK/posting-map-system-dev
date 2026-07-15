/**
 * FieldTraceAdapter.js
 * 
 * 追跡ストアからデータを抽出し、アクティブなテナント境界で安全にフィルタリングして
 * 追跡レコードの ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI原因分析・推論・判断ロジックの実装は厳禁である。
 */

class FieldTraceAdapter {
  /**
   * 現場追跡画面用の ViewModel を取得する
   * @returns {object} Immutable Field Trace ViewModel
   */
  static getFieldTraceData() {
    const tenantCtx = window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : { tenantId: "DEFAULT" };
    const activeTenantId = tenantCtx.tenantId || "DEFAULT";

    const traceStore = window.DashboardFieldTraceStore;
    const rawTrace = traceStore ? traceStore.getTraceData() : [];

    // アクティブなテナントIDに一致するレコードのみを抽出
    const tenantTrace = rawTrace.filter(t => t.tenantId === activeTenantId);

    return Object.freeze({
      tenantId: activeTenantId,
      traceList: Object.freeze(tenantTrace.map(t => Object.freeze(t)))
    });
  }
}

// グローバル公開
window.FieldTraceAdapter = FieldTraceAdapter;
