/**
 * DashboardWidgetLifecycle.js
 * 
 * ウィジェットのランタイム状態（ライフサイクル）遷移を決定論的に管理するモジュール。
 * 
 * 状態遷移フロー: CREATED ➔ REGISTERED ➔ READY ➔ RENDERED (終端状態)
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・判断ロジックの実装は厳禁である。
 */

class DashboardWidgetLifecycle {
  /**
   * ウィジェットインスタンスを次のライフサイクル状態へ決定論的に遷移させる
   * (不変化のため、新しいフリーズオブジェクトを返却する)
   * @param {object} widgetInstance フリーズされた既存のウィジェットインスタンス
   * @param {string} nextStatus 遷移先の状態 (REGISTERED, READY, RENDERED)
   * @returns {object} Newly Frozen Widget Instance Object
   */
  static transition(widgetInstance, nextStatus) {
    if (!widgetInstance) {
      throw new Error('[DashboardWidgetLifecycle] Widget instance is required');
    }

    const currentStatus = widgetInstance.status;

    // 有効な遷移ルール定義
    const validTransitions = {
      'CREATED': ['REGISTERED'],
      'REGISTERED': ['READY'],
      'READY': ['RENDERED'],
      'RENDERED': [] // RENDERED は終端状態であり、これ以降の遷移は不可
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`[DashboardWidgetLifecycle] Invalid status transition: ${currentStatus} -> ${nextStatus}`);
    }

    const updated = {
      ...widgetInstance,
      status: nextStatus
    };

    return Object.freeze(updated);
  }
}

// グローバル公開
window.DashboardWidgetLifecycle = DashboardWidgetLifecycle;
