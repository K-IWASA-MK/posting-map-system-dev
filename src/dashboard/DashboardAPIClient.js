/**
 * DashboardAPIClient.js
 * 
 * AIOS Dashboard 用 GET 通信専用 API クライアント。
 * 状態の加工や判定は行わず、Timeout（5000ms）制限のもとで GAS API からの GET 接続のみを担当する。
 * 
 * 警告：本ファイル内への書き込みメソッド（Write）の追加は厳禁である。
 */

class DashboardAPIClient {
  static TIMEOUT_MS = 5000;

  /**
   * GAS KPI summary API から JSON を GET 取得する
   * @param {string} url 取得先エンドポイント URL
   * @returns {Promise<object>} パース済みのレスポンスオブジェクト
   */
  static async fetchSummary(url = '/api/dashboard/summary') {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      // 読み取り専用 GET 通信の実行
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP通信エラー: ステータス ${response.status}`);
      }

      // レスポンスの取得とパース
      const json = await response.json();
      return json;

    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('API接続タイムアウト (5000msを超過しました)');
      }
      throw error;
    }
  }
}

// グローバル公開
window.DashboardAPIClient = DashboardAPIClient;
