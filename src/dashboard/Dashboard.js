/**
 * Dashboard.js
 * 
 * AIOS Observer Dashboard 用制御スクリプト。
 * データアダプターから取得した情報をレンダラーへ引き渡し、モーション起動を制御する。
 * 
 * 警告：本ファイル内への状態変更処理、自動修正、または本番APIへの接続コードの追加は厳禁である。
 */

class DashboardObserver {
  /**
   * ロードライフサイクルの開始
   */
  static async load() {
    this.showLoading();
    this.clearWarning();

    // 1. データアダプター経由での取得 (Read-Only)
    const result = await window.DashboardDataAdapter.fetchSummary();
    
    this.hideLoading();

    if (!result.isSuccess) {
      this.showError(result.errorMessage || 'データの取得に失敗しました。');
      return;
    }

    // 2. 状態モデル (LIVE, MOCK, WARNING, OFFLINE) に応じたヘッダー表示更新
    this.updateHeaderStatus(result.statusState, result.errorMessage);

    // 3. 更新タイムスタンプの反映
    const updateTimeEl = document.getElementById('update-time-text');
    if (updateTimeEl) {
      updateTimeEl.innerText = new Date().toLocaleTimeString();
    }

    // 4. レンダラー経由でのコンポーネント一元マウント (Props 伝播)
    window.DashboardRenderer.render(result.data);

    // 5. レンダリング完了後に初めてアニメーションを開始 (途中状態の表示防止)
    if (window.DashboardMotion) {
      window.DashboardMotion.init();
    }

    // 6. モーション完了・初回マウント完了後に、定期ポーリング更新を開始
    if (window.DashboardPollingController) {
      window.DashboardPollingController.start();
    }
  }

  /**
   * ヘッダーのステータスバッジと警告表示を更新する
   * @param {string} state LIVE / MOCK / WARNING / OFFLINE
   * @param {string} message 警告メッセージ
   */
  static updateHeaderStatus(state, message) {
    const statusTextEl = document.getElementById('status-text');
    if (!statusTextEl) return;

    statusTextEl.innerText = state;
    statusTextEl.className = ''; // クラスリセット

    if (state === 'LIVE') {
      statusTextEl.classList.add('accent-green');
    } else if (state === 'MOCK') {
      statusTextEl.classList.add('accent-blue');
    } else if (state === 'WARNING') {
      statusTextEl.classList.add('accent-orange');
      this.showWarning(message || 'Warning: データ項目の一部に欠損が発生しています。');
    } else if (state === 'OFFLINE') {
      statusTextEl.classList.add('accent-red');
      this.showWarning(message || 'Offline: 接続エラー。代替オフラインデータを使用中。');
    }
  }

  /* --- 視覚状態表示ヘルパー --- */

  static showLoading() {
    const el = document.getElementById('loading-panel');
    if (el) el.style.display = 'flex';
  }

  static hideLoading() {
    const el = document.getElementById('loading-panel');
    if (el) el.style.display = 'none';
  }

  static showWarning(message) {
    const el = document.getElementById('warning-panel');
    if (el) {
      el.innerText = message;
      el.style.display = 'block';
    }
  }

  static clearWarning() {
    const el = document.getElementById('warning-panel');
    if (el) el.style.display = 'none';
  }

  static showError(message) {
    const el = document.getElementById('error-panel');
    if (el) {
      el.innerText = message;
      el.style.display = 'flex';
    }
  }
}

// ページロード完了時にバインド処理を開始
window.addEventListener('DOMContentLoaded', () => {
  DashboardObserver.load();
});

// メモリリーク防止のためのアンロードクリーンアップ
window.addEventListener('unload', () => {
  console.log('[Dashboard] ページアンロードに伴いリソースを解放します...');
  if (window.DashboardPollingController) {
    window.DashboardPollingController.stop();
  }
  if (window.DashboardEventBus) {
    window.DashboardEventBus.clearListeners();
  }
  if (window.DashboardRenderCache) {
    window.DashboardRenderCache.clear();
  }
});
