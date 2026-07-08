/**
 * DashboardTenantContext.js
 * 
 * アプリケーション内で現在アクティブなテナント情報を一元管理する Singleton クラス。
 * セキュリティ認証や課金処理は持たず、客観的境界表現のみを提供する。
 * 
 * 警告：本ファイル内への API 通信、認証認可チェック、Stripe接続、自動ルーティングロジックの実装は厳禁である。
 */

class DashboardTenantContext {
  static #currentContext = Object.freeze({
    tenantId: "MIE-03",
    tenantName: "三重第3支部",
    environment: "SIMULATION",
    createdAt: new Date().toISOString()
  });

  /**
   * 現在のコンテキスト情報を取得する
   * @returns {object} Immutable Tenant Context Object
   */
  static getContext() {
    return this.#currentContext;
  }
}

// グローバル公開
window.DashboardTenantContext = DashboardTenantContext;
