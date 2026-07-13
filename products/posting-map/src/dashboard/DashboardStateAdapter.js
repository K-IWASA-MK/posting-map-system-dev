/**
 * DashboardStateAdapter.js
 * 
 * 状態マネージャーのスナップショットから UI 表示に必要な
 * 状態概要の不変 ViewModel を構築・抽出するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class DashboardStateAdapter {
  /**
   * 状態表示用の ViewModel を取得する
   * @returns {object} Immutable State View Model
   */
  static getDashboardStateData() {
    const manager = window.DashboardStateManager;
    const snapshot = manager ? manager.getSnapshot() : null;

    if (!snapshot) {
      return Object.freeze({
        currentWorkspace: '-',
        currentView: '-',
        currentLayout: '-',
        widgetCount: 0,
        renderStatus: 'unknown',
        initialized: false,
        stateVersion: 0,
        lastUpdated: '-'
      });
    }

    const widgetCount = Object.keys(snapshot.widgetStates || {}).length;

    return Object.freeze({
      currentWorkspace: snapshot.currentWorkspace,
      currentView: snapshot.currentView,
      currentLayout: snapshot.currentLayout,
      widgetCount: widgetCount,
      renderStatus: snapshot.renderStatus,
      initialized: snapshot.initialized,
      stateVersion: snapshot.stateVersion,
      lastUpdated: snapshot.lastUpdated
    });
  }
}

// グローバル公開
window.DashboardStateAdapter = DashboardStateAdapter;
