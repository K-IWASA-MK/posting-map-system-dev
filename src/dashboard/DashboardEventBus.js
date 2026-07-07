/**
 * DashboardEventBus.js
 * 
 * コントローラー、レンダラー、およびモーションレイヤー間を疎結合に保つための
 * 簡易 Publish/Subscribe イベント仲介モジュール。
 * 
 * 警告：本ファイル内へのデータ加工処理、API通信、状態変更ロジック、Kernel操作の追加は厳禁である。
 */

class DashboardEventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * イベントハンドラーを登録する
   * @param {string} event イベント名
   * @param {Function} callback コールバック関数
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * イベントハンドラーを解除する
   * @param {string} event イベント名
   * @param {Function} callback コールバック関数
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * イベントを発火し登録された購読者にデータを伝播する
   * @param {string} event イベント名
   * @param {any} data 伝播データ
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Dashboard EventBus] イベント配信エラー (${event}):`, error);
      }
    });
  }
}

// グローバルに単一のインスタンスを公開
window.DashboardEventBus = new DashboardEventBus();
