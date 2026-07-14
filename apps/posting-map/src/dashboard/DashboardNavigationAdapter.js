/**
 * DashboardNavigationAdapter.js
 * 
 * 登録されたナビゲーション定義と現在のアクティブ状態から、サイドバー描画やパンくずリスト（Breadcrumb）表示
 * に適した不変 ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class DashboardNavigationAdapter {
  /**
   * ナビゲーション表示用の ViewModel を構築して取得する
   * @returns {object} Immutable Navigation View Model
   */
  static getDashboardNavigationData() {
    const registry = window.DashboardNavigationRegistry;
    const manager = window.DashboardNavigationManager;

    if (!registry) {
      return Object.freeze({
        navigations: [],
        activeNavId: '-',
        breadcrumbs: []
      });
    }

    const activeNav = manager ? manager.getActiveNavigation() : null;
    const allRoutes = registry.getAllNavigations();

    // 優先度順にソートされたナビゲーションリストを解決
    const sortedRoutes = [...allRoutes].sort((a, b) => a.priority - b.priority);

    const mappedRoutes = sortedRoutes.map(nav => {
      const isActive = activeNav ? activeNav.navigationId === nav.navigationId : false;
      return Object.freeze({
        navigationId: nav.navigationId,
        navigationName: nav.navigationName,
        viewMode: nav.viewMode,
        workspaceId: nav.workspaceId,
        category: nav.category,
        route: nav.route,
        icon: nav.icon,
        isActive: isActive,
        breadcrumb: nav.breadcrumb,
        defaultView: nav.defaultView
      });
    });

    return Object.freeze({
      navigations: Object.freeze(mappedRoutes),
      activeNavId: activeNav ? activeNav.navigationId : '-',
      breadcrumbs: Object.freeze(activeNav ? [...activeNav.breadcrumb] : [])
    });
  }
}

// グローバル公開
window.DashboardNavigationAdapter = DashboardNavigationAdapter;
