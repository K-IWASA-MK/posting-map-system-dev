/**
 * DashboardLayoutRegistry.js
 * 
 * デスクトップ、タブレット、モバイル等のブレイクポイントに対応する
 * ウィジェットのグリッド座標配置（x, y, w, h）を管理するレイアウトレジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardLayoutRegistry {
  static layouts = new Map();

  /**
   * レイアウト仕様を登録する
   * @param {object} spec レイアウト仕様定義
   */
  static register(spec) {
    if (!spec || !spec.layoutId) {
      throw new Error('[DashboardLayoutRegistry] Invalid layout specification');
    }

    // 配置ウィジェット配列とその要素をフリーズして不変化
    const frozenWidgets = Object.freeze((spec.widgets || []).map(w => Object.freeze({
      widgetId: w.widgetId,
      x: typeof w.x === 'number' ? w.x : 0,
      y: typeof w.y === 'number' ? w.y : 0,
      w: typeof w.w === 'number' ? w.w : 1,
      h: typeof w.h === 'number' ? w.h : 1
    })));

    const frozenSpec = Object.freeze({
      layoutId: spec.layoutId,
      layoutName: spec.layoutName || 'Untitled Layout',
      layoutType: spec.layoutType || 'grid',
      columns: typeof spec.columns === 'number' ? spec.columns : 12,
      rows: typeof spec.rows === 'number' ? spec.rows : 6,
      widgets: frozenWidgets,
      breakpoint: spec.breakpoint || 'desktop',
      priority: typeof spec.priority === 'number' ? spec.priority : 100
    });

    this.layouts.set(spec.layoutId, frozenSpec);
  }

  /**
   * IDからレイアウト定義を取得する
   * @param {string} layoutId 
   * @returns {object|undefined} Frozen Layout Definition
   */
  static getLayout(layoutId) {
    return this.layouts.get(layoutId);
  }

  /**
   * すべてのレイアウト定義を取得する
   * @returns {array} Frozen Array of Frozen Layout Definitions
   */
  static getAllLayouts() {
    return Object.freeze(Array.from(this.layouts.values()));
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear() {
    this.layouts.clear();
  }
}

// グローバル公開とレイアウト定義の登録
window.DashboardLayoutRegistry = DashboardLayoutRegistry;

if (typeof window !== 'undefined') {
  // コアウィジェット向けのマルチブレイクポイント対応グリッドレイアウトを事前登録
  DashboardLayoutRegistry.register({
    layoutId: 'lyt-exec-desktop',
    layoutName: 'Executive Desktop Grid Layout',
    layoutType: 'grid',
    columns: 12,
    rows: 8,
    breakpoint: 'desktop',
    priority: 1,
    widgets: [
      { widgetId: 'wdg-kpi', x: 0, y: 0, w: 4, h: 2 },
      { widgetId: 'wdg-history', x: 4, y: 0, w: 8, h: 2 },
      { widgetId: 'wdg-evidence', x: 0, y: 2, w: 6, h: 3 },
      { widgetId: 'wdg-audit', x: 6, y: 2, w: 6, h: 3 }
    ]
  });

  DashboardLayoutRegistry.register({
    layoutId: 'lyt-exec-tablet',
    layoutName: 'Executive Tablet Grid Layout',
    layoutType: 'grid',
    columns: 8,
    rows: 12,
    breakpoint: 'tablet',
    priority: 2,
    widgets: [
      { widgetId: 'wdg-kpi', x: 0, y: 0, w: 8, h: 2 },
      { widgetId: 'wdg-history', x: 0, y: 2, w: 8, h: 3 },
      { widgetId: 'wdg-evidence', x: 0, y: 5, w: 4, h: 4 },
      { widgetId: 'wdg-audit', x: 4, y: 5, w: 4, h: 4 }
    ]
  });

  DashboardLayoutRegistry.register({
    layoutId: 'lyt-exec-mobile',
    layoutName: 'Executive Mobile Grid Layout',
    layoutType: 'grid',
    columns: 4,
    rows: 16,
    breakpoint: 'mobile',
    priority: 3,
    widgets: [
      { widgetId: 'wdg-kpi', x: 0, y: 0, w: 4, h: 2 },
      { widgetId: 'wdg-history', x: 0, y: 2, w: 4, h: 3 },
      { widgetId: 'wdg-evidence', x: 0, y: 5, w: 4, h: 4 }
    ]
  });
}
