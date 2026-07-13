/**
 * FieldHistoryAdapter.js
 * 
 * 履歴ストアからデータを抽出し、アクティブなテナント境界で安全にフィルタリングして
 * 時系列履歴タイムラインおよび進捗スナップショットの ViewModel を
 * 構築して提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class FieldHistoryAdapter {
  /**
   * 現場履歴画面用の ViewModel を取得する
   * @returns {object} Immutable Field History ViewModel
   */
  static getFieldHistoryData() {
    const tenantCtx = window.DashboardTenantContext ? window.DashboardTenantContext.getContext() : { tenantId: "DEFAULT" };
    const activeTenantId = tenantCtx.tenantId || "DEFAULT";

    const historyStore = window.DashboardFieldHistoryStore;
    const rawHistory = historyStore ? historyStore.getHistoryData() : { history: [], snapshots: [] };

    // 現在のアクティブテナントの履歴のみを抽出
    const tenantHistory = rawHistory.history.filter(e => e.tenantId === activeTenantId);

    return Object.freeze({
      tenantId: activeTenantId,
      historyTimeline: Object.freeze(tenantHistory.map(e => Object.freeze(e))),
      historySnapshots: Object.freeze(rawHistory.snapshots.map(s => Object.freeze(s)))
    });
  }
}

// グローバル公開
window.FieldHistoryAdapter = FieldHistoryAdapter;
