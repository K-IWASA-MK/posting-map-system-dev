/**
 * DashboardNavigationRegistry.js
 * 
 * ダッシュボード上の画面ルーティングおよびナビゲーションルート定義
 * (Executive, Operations, Analytics, History, etc.) を決定論的に登録・管理するレジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardNavigationRegistry {
  static routes = new Map();

  /**
   * ナビゲーションルート仕様を登録する
   * @param {object} spec ナビゲーション定義
   */
  static register(spec) {
    if (!spec || !spec.navigationId) {
      throw new Error('[DashboardNavigationRegistry] Invalid navigation specification');
    }

    const frozenSpec = Object.freeze({
      navigationId: spec.navigationId,
      navigationName: spec.navigationName || 'Untitled Route',
      viewMode: spec.viewMode || 'executive',
      workspaceId: spec.workspaceId || 'wsp-executive',
      category: spec.category || 'general',
      route: spec.route || '/executive',
      icon: spec.icon || '',
      priority: typeof spec.priority === 'number' ? spec.priority : 100,
      status: spec.status || 'active',
      breadcrumb: Object.freeze(spec.breadcrumb ? [...spec.breadcrumb] : []), // パンくずリスト
      defaultView: !!spec.defaultView // デフォルトビュー表示フラグ
    });

    this.routes.set(spec.navigationId, frozenSpec);
  }

  /**
   * IDからナビゲーション定義を取得する
   * @param {string} navigationId 
   * @returns {object|undefined} Frozen Navigation Definition
   */
  static getNavigation(navigationId) {
    return this.routes.get(navigationId);
  }

  /**
   * ViewMode から対応するナビゲーション定義を逆引き解決する
   * @param {string} viewMode 
   * @returns {object} Frozen Navigation Definition
   */
  static getNavigationByViewMode(viewMode) {
    for (const route of this.routes.values()) {
      if (route.viewMode === viewMode) {
        return route;
      }
    }
    return this.getDefaultNavigation();
  }

  /**
   * デフォルトの初期表示ナビゲーション定義を取得する
   * @returns {object} Frozen Navigation Definition
   */
  static getDefaultNavigation() {
    for (const route of this.routes.values()) {
      if (route.defaultView) {
        return route;
      }
    }
    return Array.from(this.routes.values())[0];
  }

  /**
   * すべてのナビゲーションルート定義を取得する
   * @returns {array} Frozen Array of Frozen Navigation Definitions
   */
  static getAllNavigations() {
    return Object.freeze(Array.from(this.routes.values()));
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear() {
    this.routes.clear();
  }
}

// グローバル公開とナビゲーション登録
window.DashboardNavigationRegistry = DashboardNavigationRegistry;

if (typeof window !== 'undefined') {
  DashboardNavigationRegistry.register({
    navigationId: 'nav-executive',
    navigationName: 'Executive Summary',
    viewMode: 'executive',
    workspaceId: 'wsp-executive',
    category: 'core',
    route: '/executive',
    icon: 'dashboard',
    priority: 1,
    status: 'active',
    breadcrumb: ['Dashboard', 'Executive Summary'],
    defaultView: true
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-operations',
    navigationName: 'Live Operations',
    viewMode: 'operations',
    workspaceId: 'wsp-operations',
    category: 'core',
    route: '/operations',
    icon: 'navigation',
    priority: 2,
    status: 'active',
    breadcrumb: ['Dashboard', 'Live Operations'],
    defaultView: false
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-analytics',
    navigationName: 'Performance Analytics',
    viewMode: 'analytics',
    workspaceId: 'wsp-analytics',
    category: 'core',
    route: '/analytics',
    icon: 'analytics',
    priority: 3,
    status: 'active',
    breadcrumb: ['Dashboard', 'Performance Analytics'],
    defaultView: false
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-history',
    navigationName: 'Timeline History',
    viewMode: 'history',
    workspaceId: 'wsp-history',
    category: 'field_ops',
    route: '/history',
    icon: 'history',
    priority: 4,
    status: 'active',
    breadcrumb: ['Field Intelligence', 'Timeline History'],
    defaultView: false
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-evidence',
    navigationName: 'Evidence Ledger',
    viewMode: 'evidence',
    workspaceId: 'wsp-evidence',
    category: 'field_ops',
    route: '/evidence',
    icon: 'verified',
    priority: 5,
    status: 'active',
    breadcrumb: ['Field Intelligence', 'Evidence Ledger'],
    defaultView: false
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-audit',
    navigationName: 'Audit Trails',
    viewMode: 'audit',
    workspaceId: 'wsp-audit',
    category: 'field_ops',
    route: '/audit',
    icon: 'security',
    priority: 6,
    status: 'active',
    breadcrumb: ['Field Intelligence', 'Audit Trails'],
    defaultView: false
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-trace',
    navigationName: 'Traceability Map',
    viewMode: 'trace',
    workspaceId: 'wsp-trace',
    category: 'field_ops',
    route: '/trace',
    icon: 'route',
    priority: 7,
    status: 'active',
    breadcrumb: ['Field Intelligence', 'Traceability Map'],
    defaultView: false
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-trust',
    navigationName: 'Trust Boundaries',
    viewMode: 'trust',
    workspaceId: 'wsp-trust',
    category: 'governance',
    route: '/trust',
    icon: 'gavel',
    priority: 8,
    status: 'active',
    breadcrumb: ['Governance', 'Trust Boundaries'],
    defaultView: false
  });

  DashboardNavigationRegistry.register({
    navigationId: 'nav-tenant',
    navigationName: 'Tenant Hierarchy',
    viewMode: 'tenant',
    workspaceId: 'wsp-tenant',
    category: 'governance',
    route: '/tenant',
    icon: 'domain',
    priority: 9,
    status: 'active',
    breadcrumb: ['Governance', 'Tenant Hierarchy'],
    defaultView: false
  });
}
