/**
 * DashboardRenderAdapter.js
 * 
 * 描画パイプラインのアクティブコンテキストから、UI 状態表示に必要な
 * パイプライン概要・描画キューの不変 ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class DashboardRenderAdapter {
  /**
   * パイプライン状態表示用の ViewModel を取得する
   * @returns {object} Immutable Render Pipeline View Model
   */
  static getDashboardRenderData() {
    const pipeline = window.DashboardRenderingPipeline;
    const context = pipeline ? pipeline.getActiveContext() : null;

    if (!context) {
      return Object.freeze({
        renderStatus: 'unknown',
        currentWorkspace: '-',
        currentLayout: '-',
        currentNavigation: '-',
        widgetQueueCount: 0,
        widgetQueue: Object.freeze([]),
        renderVersion: 0,
        renderTime: '-'
      });
    }

    return Object.freeze({
      renderStatus: context.renderStatus,
      currentWorkspace: context.workspace,
      currentLayout: context.layout,
      currentNavigation: context.navigation,
      widgetQueueCount: context.widgets.length,
      widgetQueue: Object.freeze([...context.widgets]),
      renderVersion: context.renderVersion,
      renderTime: context.timestamp
    });
  }
}

// グローバル公開
window.DashboardRenderAdapter = DashboardRenderAdapter;
