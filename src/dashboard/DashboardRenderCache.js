/**
 * DashboardRenderCache.js
 * 
 * コンポーネント描画用のキャッシュ基盤。
 * 各コンポーネントに渡された Props オブジェクトの JSON 表現をキャッシュし、不変判定を行う。
 * 
 * 警告：本ファイル内での API 通信、データ加工、状態管理（データフロー変更）の実装は厳禁である。
 */

class DashboardRenderCache {
  static store = {};

  /**
   * コンポーネントの Props が変更されたか判定し、キャッシュを更新する
   * @param {string} key コンポーネントの識別キー
   * @param {object} props 渡された新しい Props
   * @returns {boolean} 変更があった場合（または初回）は true、変更がない場合は false
   */
  static hasChanged(key, props) {
    try {
      const nextString = JSON.stringify(props);
      const prevString = this.store[key];

      if (prevString === nextString) {
        return false; // 変更なし（再描画不要）
      }

      this.store[key] = nextString;
      return true; // 変更あり（再描画が必要）
    } catch (e) {
      console.warn(`[Dashboard Render Cache] ハッシュ比較に失敗したため、強制再描画します: ${key}`, e.message);
      return true;
    }
  }

  /**
   * キャッシュされた値を全削除する
   */
  static clear() {
    this.store = {};
    console.log('[Dashboard Render Cache] キャッシュがクリアされました。');
  }
}

// グローバル公開
window.DashboardRenderCache = DashboardRenderCache;
