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
  /**
   * イベントハンドラーを登録する
   * @param {string} event イベント名
   * @param {Function} callback コールバック関数
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    // 重複登録を防止する
    if (this.listeners[event].includes(callback)) {
      console.warn(`[Dashboard EventBus] リスナーは既に登録されています: ${event}`);
      return;
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
   * 明示的な購読解除 (offのエイリアス)
   */
  unsubscribe(event, callback) {
    this.off(event, callback);
  }

  /**
   * すべてのリスナーをクリアし、メモリ解放する
   */
  clearListeners() {
    this.listeners = {};
    console.log('[Dashboard EventBus] すべてのイベントリスナーがクリアされました。');
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
