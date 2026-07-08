/**
 * DashboardWorkspaceRegistry.js
 * 
 * ダッシュボード上の各種ワークスペース定義 (Executive, Operations, Analytics, etc.) を
 * 決定論的に登録・管理するワークスペースレジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardWorkspaceRegistry {
  static workspaces = new Map();

  /**
   * ワークスペース仕様を登録する
   * @param {object} spec ワークスペース仕様定義
   */
  static register(spec) {
    if (!spec || !spec.workspaceId) {
      throw new Error('[DashboardWorkspaceRegistry] Invalid workspace specification');
    }

    const frozenSpec = Object.freeze({
      workspaceId: spec.workspaceId,
      workspaceName: spec.workspaceName || 'Untitled Workspace',
      workspaceCategory: spec.workspaceCategory || 'general',
      description: spec.description || '',
      layoutId: spec.layoutId || 'lyt-exec-desktop',
      widgetIds: Object.freeze(spec.widgetIds ? [...spec.widgetIds] : []),
      priority: typeof spec.priority === 'number' ? spec.priority : 100,
      status: spec.status || 'active',
      viewMode: spec.viewMode || 'executive' // ナビゲーションおよびサイドメニューに対応するクエリ文字列値
    });

    this.workspaces.set(spec.workspaceId, frozenSpec);
  }

  /**
   * IDからワークスペース定義を取得する
   * @param {string} workspaceId 
   * @returns {object|undefined} Frozen Workspace Definition
   */
  static getWorkspace(workspaceId) {
    return this.workspaces.get(workspaceId);
  }

  /**
   * 登録されているすべてのワークスペース定義を取得する
   * @returns {array} Frozen Array of Frozen Workspace Definitions
   */
  static getAllWorkspaces() {
    return Object.freeze(Array.from(this.workspaces.values()));
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear() {
    this.workspaces.clear();
  }
}

// グローバル公開とワークスペース登録
window.DashboardWorkspaceRegistry = DashboardWorkspaceRegistry;

if (typeof window !== 'undefined') {
  // 静的に管理される初期コアワークスペース群の登録
  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-executive',
    workspaceName: 'Executive Operations Workspace',
    workspaceCategory: 'executive',
    description: 'Executive view aggregating real-time KPIs and system audit tracks.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-kpi', 'wdg-history', 'wdg-evidence', 'wdg-audit'],
    priority: 1,
    status: 'active',
    viewMode: 'executive'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-operations',
    workspaceName: 'Operations Monitoring Workspace',
    workspaceCategory: 'operational',
    description: 'Field activity tracking and live deployment stats.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-kpi', 'wdg-history'],
    priority: 2,
    status: 'active',
    viewMode: 'operations'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-analytics',
    workspaceName: 'Analytics Dashboard Workspace',
    workspaceCategory: 'operational',
    description: 'Historical performance metrics and coverage ratios.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-kpi', 'wdg-history'],
    priority: 3,
    status: 'active',
    viewMode: 'analytics'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-history',
    workspaceName: 'Field History Workspace',
    workspaceCategory: 'operational',
    description: 'Deep audit trails of all field activity events.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-history'],
    priority: 4,
    status: 'active',
    viewMode: 'history'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-evidence',
    workspaceName: 'Evidence Trail Workspace',
    workspaceCategory: 'trust',
    description: 'Immutable evidence ledger for validation records.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-evidence'],
    priority: 5,
    status: 'active',
    viewMode: 'evidence'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-audit',
    workspaceName: 'Audit Ledger Workspace',
    workspaceCategory: 'trust',
    description: 'Audit logs tracking workspace configuration integrity.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-audit'],
    priority: 6,
    status: 'active',
    viewMode: 'audit'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-trace',
    workspaceName: 'Traceability Map Workspace',
    workspaceCategory: 'trust',
    description: 'Complete traceability chains showing event lineage.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-trace'],
    priority: 7,
    status: 'active',
    viewMode: 'trace'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-trust',
    workspaceName: 'Trust & Governance Workspace',
    workspaceCategory: 'trust',
    description: 'Compliance metrics and secure boundary validation panels.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-evidence'],
    priority: 8,
    status: 'active',
    viewMode: 'trust'
  });

  DashboardWorkspaceRegistry.register({
    workspaceId: 'wsp-tenant',
    workspaceName: 'Tenant Boundary Workspace',
    workspaceCategory: 'tenant',
    description: 'Multitenancy scope verification and access logs.',
    layoutId: 'lyt-exec-desktop',
    widgetIds: ['wdg-kpi'],
    priority: 9,
    status: 'active',
    viewMode: 'tenant'
  });
}
