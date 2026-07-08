/**
 * DashboardNavigationManager.js
 * 
 * ダッシュボードのアクティブなナビゲーションルート、URL クエリ、および
 * 状態マネージャー（StateManager）の Workspace/Layout の状態更新の同期管理を行うマネージャー。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardNavigationManager {
  static activeNavigation = null;

  /**
   * ナビゲーションマネージャーを初期化し、現在の URL ビューパラメータから
   * アクティブナビゲーションを解決して初期設定する
   */
  static init() {
    let viewMode = 'executive';
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      viewMode = params.get('view') || 'executive';
    }

    const navRegistry = window.DashboardNavigationRegistry;
    if (navRegistry) {
      const activeNav = navRegistry.getNavigationByViewMode(viewMode);
      this.activeNavigation = activeNav;
    }
  }

  /**
   * 現在のアクティブなナビゲーション定義を取得する
   * @returns {object|null} Frozen Navigation Definition
   */
  static getActiveNavigation() {
    return this.activeNavigation;
  }

  /**
   * 指定したビューモードへの決定論的ナビゲーション遷移を実行し、状態木および
   * EventBus を介した画面変更通知をトリガーする
   * @param {string} viewMode 
   * @returns {object|undefined} Target Navigation Definition
   */
  static navigateTo(viewMode) {
    const navRegistry = window.DashboardNavigationRegistry;
    const stateManager = window.DashboardStateManager;
    const workspaceRegistry = window.DashboardWorkspaceRegistry;

    if (!navRegistry) return;

    const targetNav = navRegistry.getNavigationByViewMode(viewMode);
    if (!targetNav) return;

    this.activeNavigation = targetNav;

    // 状態マネージャー (StateManager) との同期
    if (stateManager) {
      // 関連するワークスペース定義からレイアウトIDを解決
      let layoutId = 'lyt-exec-desktop';
      if (workspaceRegistry) {
        const workspaceSpec = workspaceRegistry.getWorkspace(targetNav.workspaceId);
        if (workspaceSpec) {
          layoutId = workspaceSpec.layoutId;
        }
      }

      stateManager.updateState({
        currentWorkspace: targetNav.workspaceId,
        currentView: targetNav.viewMode,
        currentLayout: layoutId
      });
    }

    // 変更通知の発行
    if (window.DashboardEventBus) {
      window.DashboardEventBus.emit('dashboard-navigation-change', targetNav);
    }

    return targetNav;
  }
}

// グローバル公開と自動初期化
window.DashboardNavigationManager = DashboardNavigationManager;
if (typeof window !== 'undefined') {
  DashboardNavigationManager.init();
}
