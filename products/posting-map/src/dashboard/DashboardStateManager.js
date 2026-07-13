/**
 * DashboardStateManager.js
 * 
 * ダッシュボードの状態（State）の変更、バージョンカウント、および
 * 不変オブジェクトの合成・適用・EventBus同期通知を管理する状態マネージャー。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardStateManager {
  /**
   * 状態管理マネージャーを初期化し、初期状態をストアへ登録する
   */
  static init() {
    const initialWidgetStates = {};
    if (window.DashboardWidgetRegistry) {
      window.DashboardWidgetRegistry.getAllWidgets().forEach(w => {
        initialWidgetStates[w.widgetId] = 'RENDERED';
      });
    }

    const initialState = {
      currentWorkspace: 'wsp-executive',
      currentView: 'executive',
      currentLayout: 'lyt-exec-desktop',
      widgetStates: Object.freeze(initialWidgetStates),
      layoutState: Object.freeze({}),
      workspaceState: Object.freeze({}),
      initialized: true,
      renderStatus: 'rendered',
      stateVersion: 1, // 初期バージョン
      lastUpdated: new Date().toISOString() // 初期更新時刻
    };

    if (window.DashboardStateStore) {
      window.DashboardStateStore.initialize(initialState);
    }
  }

  /**
   * 現在の状態木のスナップショットを取得する
   * @returns {object|null} Frozen State Tree
   */
  static getSnapshot() {
    return window.DashboardStateStore ? window.DashboardStateStore.getState() : null;
  }

  /**
   * 決定論的な差分更新を実行し、バージョンをカウントアップした新規フリーズ状態木を適用する
   * @param {object|function} updater 差分オブジェクトまたは更新関数
   * @returns {object} Newly Frozen State Tree Object
   */
  static updateState(updater) {
    if (!window.DashboardStateStore) return;

    const currentState = window.DashboardStateStore.getState();
    if (!currentState) return;

    // 更新関数または差分オブジェクトの評価
    const updates = typeof updater === 'function' ? updater(currentState) : updater;

    const nextWidgetStates = updates.widgetStates ? { ...updates.widgetStates } : { ...currentState.widgetStates };

    const nextState = {
      ...currentState,
      ...updates,
      widgetStates: Object.freeze(nextWidgetStates),
      layoutState: Object.freeze(updates.layoutState ? { ...updates.layoutState } : { ...currentState.layoutState }),
      workspaceState: Object.freeze(updates.workspaceState ? { ...updates.workspaceState } : { ...currentState.workspaceState }),
      stateVersion: currentState.stateVersion + 1, // バージョンインクリメント
      lastUpdated: new Date().toISOString() // 更新日時
    };

    const frozenNextState = Object.freeze(nextState);
    window.DashboardStateStore.setState(frozenNextState);

    // EventBus 経由で全リスナーへ同期通知
    if (window.DashboardEventBus) {
      window.DashboardEventBus.emit('dashboard-state-update', frozenNextState);
    }

    return frozenNextState;
  }
}

// グローバル公開（初期化は DashboardRuntimeManager.boot() が担当）
window.DashboardStateManager = DashboardStateManager;
