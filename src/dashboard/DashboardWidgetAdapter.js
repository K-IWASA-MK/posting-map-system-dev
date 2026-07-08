/**
 * DashboardWidgetAdapter.js
 * 
 * レジストリから登録ウィジェットを取得し、ライフサイクル状態を解決したうえで、
 * ビュー表示用の不変 ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class DashboardWidgetAdapter {
  /**
   * ダッシュボードウィジェット管理用の ViewModel を取得する
   * @returns {object} Immutable Widget View Model
   */
  static getDashboardWidgetData() {
    const registry = window.DashboardWidgetRegistry;
    if (!registry) {
      return Object.freeze({ widgets: [] });
    }

    const rawSpecs = registry.getAllWidgets();

    // 仕様からインスタンスを生成し、READY -> RENDERED までの状態遷移を検証的に適用する
    const instances = rawSpecs.map(spec => {
      let inst = window.DashboardWidgetFactory.createWidget(spec);
      inst = window.DashboardWidgetLifecycle.transition(inst, 'REGISTERED');
      inst = window.DashboardWidgetLifecycle.transition(inst, 'READY');
      inst = window.DashboardWidgetLifecycle.transition(inst, 'RENDERED');
      return inst;
    });

    // 優先度 (widgetPriority) の昇順でソート
    const sorted = instances.sort((a, b) => a.spec.widgetPriority - b.spec.widgetPriority);

    return Object.freeze({
      widgets: Object.freeze(sorted.map(w => Object.freeze(w)))
    });
  }
}

// グローバル公開
window.DashboardWidgetAdapter = DashboardWidgetAdapter;
