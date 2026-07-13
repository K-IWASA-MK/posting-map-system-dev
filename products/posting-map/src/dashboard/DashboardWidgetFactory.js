/**
 * DashboardWidgetFactory.js
 * 
 * レジストリ仕様に基づいてウィジェットインスタンスを生成・バリデーションするファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardWidgetFactory {
  static instanceCounter = 0;

  /**
   * ウィジェット仕様からウィジェットインスタンスを生成する
   * @param {object} spec レジストリに登録されたウィジェット仕様
   * @returns {object} Frozen Widget Instance Object
   */
  static createWidget(spec) {
    if (!spec) {
      throw new Error('[DashboardWidgetFactory] Specification is required');
    }
    if (!spec.widgetId) {
      throw new Error('[DashboardWidgetFactory] widgetId is required');
    }
    if (!spec.componentName) {
      throw new Error('[DashboardWidgetFactory] componentName is required');
    }

    const uniqueId = `inst-${spec.widgetId}-${++DashboardWidgetFactory.instanceCounter}`;

    const widgetInstance = {
      instanceId: uniqueId,
      widgetId: spec.widgetId,
      componentName: spec.componentName,
      spec: spec, // フリーズ済みの仕様オブジェクトへの参照
      metadata: Object.freeze({
        createdAt: new Date().toISOString(),
        environment: 'LOCAL_SIMULATION'
      }),
      status: 'CREATED' // 初期状態
    };

    return Object.freeze(widgetInstance);
  }
}

// グローバル公開
window.DashboardWidgetFactory = DashboardWidgetFactory;
