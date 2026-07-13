/**
 * DashboardWidgetRegistry.js
 * 
 * ダッシュボード上のすべてのウィジェットを登録・管理するレジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardWidgetRegistry {
  static widgets = new Map();

  /**
   * ウィジェットをレジストリに登録する
   * @param {object} spec ウィジェット仕様
   */
  static register(spec) {
    if (!spec || !spec.widgetId) {
      throw new Error('[DashboardWidgetRegistry] Invalid widget specification');
    }

    // 仕様オブジェクトをディープフリーズして不変化
    const frozenSpec = Object.freeze({
      widgetId: spec.widgetId,
      widgetType: spec.widgetType || 'card',
      widgetCategory: spec.widgetCategory || 'general',
      widgetTitle: spec.widgetTitle || 'Untitled Widget',
      widgetVersion: spec.widgetVersion || '1.0.0',
      widgetPriority: typeof spec.widgetPriority === 'number' ? spec.widgetPriority : 100,
      widgetStatus: spec.widgetStatus || 'active',
      viewModes: Object.freeze(spec.viewModes ? [...spec.viewModes] : []),
      componentName: spec.componentName || 'GenericComponent'
    });

    this.widgets.set(spec.widgetId, frozenSpec);
  }

  /**
   * IDからウィジェット仕様を取得する
   * @param {string} widgetId 
   * @returns {object|undefined} Frozen Widget Specification
   */
  static getWidget(widgetId) {
    return this.widgets.get(widgetId);
  }

  /**
   * 登録されているすべてのウィジェット仕様を不変配列として取得する
   * @returns {array} Frozen Array of Frozen Specifications
   */
  static getAllWidgets() {
    return Object.freeze(Array.from(this.widgets.values()));
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear() {
    this.widgets.clear();
  }
}

// グローバル公開とコアウィジェットの自動登録
window.DashboardWidgetRegistry = DashboardWidgetRegistry;

if (typeof window !== 'undefined') {
  DashboardWidgetRegistry.register({
    widgetId: 'wdg-kpi',
    widgetType: 'card',
    widgetCategory: 'operational',
    widgetTitle: 'Executive KPI Card',
    widgetVersion: '1.0.0',
    widgetPriority: 1,
    widgetStatus: 'active',
    viewModes: ['executive', 'mobile'],
    componentName: 'ExecutiveKPICard'
  });

  DashboardWidgetRegistry.register({
    widgetId: 'wdg-history',
    widgetType: 'card',
    widgetCategory: 'operational',
    widgetTitle: 'Field Activity History Timeline',
    widgetVersion: '1.0.0',
    widgetPriority: 2,
    widgetStatus: 'active',
    viewModes: ['history'],
    componentName: 'FieldHistoryTimelineCard'
  });

  DashboardWidgetRegistry.register({
    widgetId: 'wdg-evidence',
    widgetType: 'card',
    widgetCategory: 'operational',
    widgetTitle: 'Field Intelligence Evidence Trail',
    widgetVersion: '1.0.0',
    widgetPriority: 3,
    widgetStatus: 'active',
    viewModes: ['evidence'],
    componentName: 'FieldEvidenceCard'
  });

  DashboardWidgetRegistry.register({
    widgetId: 'wdg-audit',
    widgetType: 'card',
    widgetCategory: 'operational',
    widgetTitle: 'Field Intelligence Audit Ledger',
    widgetVersion: '1.0.0',
    widgetPriority: 4,
    widgetStatus: 'active',
    viewModes: ['audit'],
    componentName: 'FieldAuditCard'
  });

  DashboardWidgetRegistry.register({
    widgetId: 'wdg-trace',
    widgetType: 'card',
    widgetCategory: 'operational',
    widgetTitle: 'Field Intelligence Traceability Ledger',
    widgetVersion: '1.0.0',
    widgetPriority: 5,
    widgetStatus: 'active',
    viewModes: ['trace'],
    componentName: 'FieldTraceCard'
  });
}
