/**
 * DashboardLayoutEngine.js
 * 
 * 画面幅 (Viewport Width) からレスポンシブなブレイクポイントを決定論的に算出し、
 * ウィジェット仕様の存在バリデーションを実行したうえで、適合するレイアウトを解決するエンジン。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardLayoutEngine {
  /**
   * ビューポート幅からブレイクポイント文字列を取得する
   * @param {number} [width] 画面幅 (未指定時は window.innerWidth)
   * @returns {string} 'desktop' | 'tablet' | 'mobile'
   */
  static evaluateBreakpoint(width) {
    const w = typeof width === 'number' ? width : (typeof window !== 'undefined' ? window.innerWidth : 1200);
    if (w >= 1024) return 'desktop';
    if (w >= 768) return 'tablet';
    return 'mobile';
  }

  /**
   * 指定した画面幅に対応するアクティブなレイアウトインスタンスを決定論的に解決する
   * @param {number} [width] 画面幅
   * @returns {object} Frozen Layout Instance Object
   */
  static resolveActiveLayout(width) {
    const breakpoint = this.evaluateBreakpoint(width);
    const layoutRegistry = window.DashboardLayoutRegistry;
    const widgetRegistry = window.DashboardWidgetRegistry;

    if (!layoutRegistry) {
      return Object.freeze({
        layoutId: 'none',
        layoutName: 'No Layout Registry Found',
        layoutType: 'grid',
        columns: 12,
        rows: 6,
        widgets: Object.freeze([]),
        breakpoint,
        priority: 999
      });
    }

    const allLayouts = layoutRegistry.getAllLayouts();
    
    // 現在のブレイクポイントに適合するレイアウトを検索
    let activeSpec = allLayouts.find(l => l.breakpoint === breakpoint);

    // 適合レイアウトが見つからない場合は、優先度 (priority) 順でフォールバック
    if (!activeSpec) {
      const sorted = [...allLayouts].sort((a, b) => a.priority - b.priority);
      activeSpec = sorted[0];
    }

    if (!activeSpec) {
      return Object.freeze({
        layoutId: 'none',
        layoutName: 'No Registered Layout Spec Available',
        layoutType: 'grid',
        columns: 12,
        rows: 6,
        widgets: Object.freeze([]),
        breakpoint,
        priority: 999
      });
    }

    // バリデーション: 各配置ウィジェットが Widget Registry に存在するかを確認し、存在しないものは除外する
    const validatedWidgets = (activeSpec.widgets || []).filter(w => {
      // 独立したテスト環境で Widget Registry がない場合はパスする
      if (!widgetRegistry) return true;
      return widgetRegistry.getWidget(w.widgetId) !== undefined;
    });

    const layoutInstance = {
      layoutId: activeSpec.layoutId,
      layoutName: activeSpec.layoutName,
      layoutType: activeSpec.layoutType,
      columns: activeSpec.columns,
      rows: activeSpec.rows,
      widgets: Object.freeze(validatedWidgets.map(w => Object.freeze({
        widgetId: w.widgetId,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h
      }))),
      breakpoint,
      priority: activeSpec.priority,
      metadata: Object.freeze({
        computedAt: new Date().toISOString(),
        viewportWidth: typeof width === 'number' ? width : (typeof window !== 'undefined' ? window.innerWidth : 1200)
      })
    };

    return Object.freeze(layoutInstance);
  }
}

// グローバル公開
window.DashboardLayoutEngine = DashboardLayoutEngine;
