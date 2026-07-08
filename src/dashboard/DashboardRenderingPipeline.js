/**
 * DashboardRenderingPipeline.js
 * 
 * ダッシュボードの描画フェーズ (INIT, CONTEXT_ASSEMBLED, VALIDATED, QUEUE_ORDERED, EXECUTING, COMPLETED)
 * を決定論的に管理し、優先度順ソート済みの描画キューを駆動するパイプラインコントローラー。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardRenderingPipeline {
  static currentContext = null;
  static renderVersion = 0;

  /**
   * パイプラインを初期化する
   */
  static initialize() {
    this.renderVersion = 0;
    this.currentContext = null;
  }

  /**
   * 指定したビューモードおよびビューポート幅情報から描画パイプラインを駆動する
   * @param {string} viewMode 
   * @param {number} viewportWidth 
   * @returns {object} Frozen Render Context Snapshot Object
   */
  static run(viewMode, viewportWidth) {
    const navRegistry = window.DashboardNavigationRegistry;
    const workspaceRegistry = window.DashboardWorkspaceRegistry;
    const layoutRegistry = window.DashboardLayoutRegistry;
    const widgetRegistry = window.DashboardWidgetRegistry;
    const stateManager = window.DashboardStateManager;

    this.renderVersion++;

    // 1. INIT フェーズ
    let context = window.DashboardRenderContext.buildContext({
      renderStatus: 'INIT',
      renderVersion: this.renderVersion
    });
    this.currentContext = context;

    // 2. CONTEXT_ASSEMBLED フェーズ
    const navigation = navRegistry ? navRegistry.getNavigationByViewMode(viewMode) : null;
    const workspace = navigation ? workspaceRegistry.getWorkspace(navigation.workspaceId) : null;
    const layoutId = workspace ? workspace.layoutId : '-';

    // ビューポート幅からレスポンシブブレイクポイントを判定
    let viewport = 'desktop';
    if (viewportWidth < 768) viewport = 'mobile';
    else if (viewportWidth < 1024) viewport = 'tablet';

    const widgetIds = workspace ? [...workspace.widgetIds] : [];

    context = window.DashboardRenderContext.buildContext({
      workspace: workspace ? workspace.workspaceId : '-',
      layout: layoutId,
      navigation: navigation ? navigation.navigationId : '-',
      state: stateManager ? stateManager.getSnapshot() : {},
      widgets: widgetIds,
      viewport: viewport,
      renderStatus: 'CONTEXT_ASSEMBLED',
      renderVersion: this.renderVersion
    });
    this.currentContext = context;

    // 3. VALIDATED フェーズ
    // レイアウト存在整合性検証
    if (layoutRegistry && layoutId !== '-' && !layoutRegistry.getLayout(layoutId)) {
      throw new Error(`[DashboardRenderingPipeline] Invalid layout referenced: ${layoutId}`);
    }
    // ウィジェット存在整合性検証
    if (widgetRegistry) {
      widgetIds.forEach(id => {
        if (!widgetRegistry.getWidget(id)) {
          throw new Error(`[DashboardRenderingPipeline] Invalid widget referenced: ${id}`);
        }
      });
    }

    context = window.DashboardRenderContext.buildContext({
      ...context,
      renderStatus: 'VALIDATED'
    });
    this.currentContext = context;

    // 4. QUEUE_ORDERED フェーズ (優先度順の決定論的ソート)
    const sortedWidgets = [...widgetIds];
    if (widgetRegistry) {
      sortedWidgets.sort((a, b) => {
        const specA = widgetRegistry.getWidget(a);
        const specB = widgetRegistry.getWidget(b);
        const prioA = specA ? specA.priority : 100;
        const prioB = specB ? specB.priority : 100;
        return prioA - prioB;
      });
    }

    context = window.DashboardRenderContext.buildContext({
      ...context,
      widgets: sortedWidgets,
      renderStatus: 'QUEUE_ORDERED'
    });
    this.currentContext = context;

    // 5. EXECUTING フェーズ
    context = window.DashboardRenderContext.buildContext({
      ...context,
      renderStatus: 'EXECUTING'
    });
    this.currentContext = context;

    // 6. COMPLETED フェーズ
    context = window.DashboardRenderContext.buildContext({
      ...context,
      renderStatus: 'COMPLETED'
    });
    this.currentContext = context;

    // レンダー完了ステータスを状態マネージャーに書き戻し同期
    if (stateManager) {
      stateManager.updateState({
        renderStatus: 'rendered'
      });
    }

    // EventBus 経由で完了イベントを発行
    if (window.DashboardEventBus) {
      window.DashboardEventBus.emit('dashboard-render-complete', context);
    }

    return context;
  }

  /**
   * 現在アクティブな描画コンテキストを取得する
   * @returns {object|null} Frozen Render Context
   */
  static getActiveContext() {
    return this.currentContext;
  }
}

// グローバル公開と自動初期化
window.DashboardRenderingPipeline = DashboardRenderingPipeline;
if (typeof window !== 'undefined') {
  DashboardRenderingPipeline.initialize();
}
