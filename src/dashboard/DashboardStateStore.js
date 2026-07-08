/**
 * DashboardStateStore.js
 * 
 * ダッシュボード全体のランタイム状態木 (State Tree) を不変状態で保持するストア。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardStateStore {
  static state = null;

  /**
   * ストアの初期状態を設定する
   * @param {object} initialState 
   */
  static initialize(initialState) {
    this.state = Object.freeze(initialState);
  }

  /**
   * 現在の状態木を取得する
   * @returns {object} Frozen State Tree
   */
  static getState() {
    return this.state;
  }

  /**
   * 新しい状態木をストアへ書き込む（不変性を保証するためにフリーズされる）
   * @param {object} newState 
   */
  static setState(newState) {
    this.state = Object.freeze(newState);
  }
}

// グローバル公開
window.DashboardStateStore = DashboardStateStore;
