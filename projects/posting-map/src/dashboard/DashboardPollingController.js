/**
 * DashboardPollingController.js
 * 
 * 読み取り専用データ取得（GET）の定期ポーリングを制御するコントローラー。
 * 障害時の指数バックオフ（Exponential Backoff）再試行、およびイベントバス連携を担う。
 * 
 * 警告：本ファイル内への POST, PUT, DELETE などの書込み処理の追加は厳禁である。
 */

class DashboardPollingController {
  static DEFAULT_INTERVAL = 10000; // 通常時：10秒
  static MIN_INTERVAL = 2000;       // 初期バックオフ：2秒
  static MAX_INTERVAL = 60000;      // 最大バックオフ：60秒
  static BACKOFF_FACTOR = 2.0;

  static intervalId = null;
  static currentInterval = 10000;
  static isRunning = false;
  static consecutiveFailures = 0;
  
  static hasBoundVisibility = false;
  static isTabVisible = true;
  static isFetching = false;

  static realtimeState = 'POLLING_BACKUP'; // CONNECTED, DEGRADED, POLLING_BACKUP
  static hasBoundRealtime = false;

  /**
   * ポーリングサイクルを開始する
   */
  static start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentInterval = this.DEFAULT_INTERVAL;
    this.consecutiveFailures = 0;
    this.isTabVisible = document.visibilityState !== 'hidden';

    // 一度だけ Visibility 監視イベントをバインド
    if (!this.hasBoundVisibility) {
      this.hasBoundVisibility = true;
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    // 一度だけリアルタイム接続状態イベントをバインド
    if (!this.hasBoundRealtime) {
      this.hasBoundRealtime = true;
      window.DashboardEventBus.on('realtime-status-changed', (status) => this.handleRealtimeStatusChange(status));
    }
    
    console.log('[Dashboard Polling] ポーリングを開始します。更新間隔:', this.currentInterval, 'ms');
    this.scheduleNext();
  }

  /**
   * ポーリングサイクルを停止する
   */
  static stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    console.log('[Dashboard Polling] ポーリングを停止しました。');
  }

  /**
   * 次回のデータ取得をスケジュールする (setTimeoutによる動的インターバル制御)
   */
  static scheduleNext() {
    if (!this.isRunning || !this.isTabVisible) return;

    // リアルタイム接続が確立されている場合は、定時ポーリングのスケジュールを抑止する (Backupモード)
    if (this.realtimeState === 'REALTIME_CONNECTED' || this.realtimeState === 'REALTIME_DEGRADED') {
      console.log('[Dashboard Polling] リアルタイム通信が稼働中のため、定時ポーリングを抑止します。');
      return;
    }
    
    if (this.intervalId) {
      clearTimeout(this.intervalId);
    }

    this.intervalId = setTimeout(async () => {
      await this.tick();
      this.scheduleNext();
    }, this.currentInterval);
  }

  /**
   * 1ポーリングごとのデータ取得および障害制御
   */
  static async tick() {
    if (!this.isRunning || this.isFetching) return;
    this.isFetching = true;

    try {
      // データアダプター経由での取得 (Read-Only)
      const result = await window.DashboardDataAdapter.fetchSummary();

      // 接続障害 (OFFLINE または スキーマ不整合警告) のハンドリング
      if (result.statusState === 'OFFLINE' || result.statusState === 'WARNING') {
        this.handleFailure();
        // 障害状態でもバナー更新等のためイベントを発火
        window.DashboardEventBus.emit('dashboard-updated', result);
        return;
      }

      // 正常完了 ──> リトライ・バックオフのリセット
      this.handleSuccess();

      // 新着ログの有無を差分検出
      if (result.data && result.data.logs) {
        const newLogs = window.DashboardDataAdapter.detectNewLogs(result.data.logs);
        if (newLogs && newLogs.length > 0) {
          // 新しいログをイベントバス経由で通知
          window.DashboardEventBus.emit('new-activity-logs', newLogs);
        }
      }

      // 全体更新完了イベントの発行 (KPIカード等の再描画連携用)
      window.DashboardEventBus.emit('dashboard-updated', result);
    } catch (e) {
      console.error('[Dashboard Polling] Tick取得中に想定外のエラーが発生しました:', e);
      this.handleFailure();
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * 取得成功時のパラメータ復帰処理
   */
  static handleSuccess() {
    if (this.consecutiveFailures > 0) {
      console.log('[Dashboard Polling] 接続が正常に復旧しました。通常インターバルに戻ります。');
    }
    this.consecutiveFailures = 0;
    this.currentInterval = this.DEFAULT_INTERVAL;
  }

  /**
   * 障害検知時の指数バックオフ計算
   */
  static handleFailure() {
    this.consecutiveFailures++;
    
    // バックオフ間隔の計算 (例: 2s -> 4s -> 8s -> 16s -> ... -> 最大60s)
    const backoff = this.MIN_INTERVAL * Math.pow(this.BACKOFF_FACTOR, this.consecutiveFailures - 1);
    this.currentInterval = Math.min(this.MAX_INTERVAL, backoff);

    console.warn(
      `[Dashboard Polling] 接続障害を検知しました (連続 ${this.consecutiveFailures} 回)。`,
      `指数バックオフを適用します。次回取得まで: ${this.currentInterval} ms`
    );
  }

  /**
   * タブの表示状態変更イベントハンドラ
   */
  static handleVisibilityChange() {
    const isHidden = document.visibilityState === 'hidden';
    this.isTabVisible = !isHidden;
    console.log(`[Dashboard Polling] VisibilityState変更検知: isTabVisible = ${this.isTabVisible}`);

    if (isHidden) {
      console.log('[Dashboard Polling] タブが非表示のため、タイマーをクリアしてポーリングを一時停止します。');
      if (this.intervalId) {
        clearTimeout(this.intervalId);
        this.intervalId = null;
      }
    } else {
      console.log('[Dashboard Polling] タブが再度表示されました。ポーリングを再開します。');
      if (this.isRunning && this.realtimeState === 'POLLING_BACKUP') {
        // 重複実行を防止しつつ、復帰した瞬間に即座に最新データを1回取得する
        this.tick().then(() => this.scheduleNext());
      }
    }
  }

  /**
   * リアルタイムストリームの接続状態変化に応じたフォールバック制御 (状態マシン)
   * @param {object} status 
   */
  static handleRealtimeStatusChange(status) {
    const prevState = this.realtimeState;
    
    switch (status.state) {
      case 'LIVE':
        this.realtimeState = 'REALTIME_CONNECTED';
        console.log('[Dashboard Polling] リアルタイム接続確立。自動ポーリングを抑止（Backupモード）します。');
        if (this.intervalId) {
          clearTimeout(this.intervalId);
          this.intervalId = null;
        }
        break;

      case 'CONNECTING':
        this.realtimeState = 'REALTIME_DEGRADED';
        console.log('[Dashboard Polling] リアルタイム切断。再接続プロセス中（Degradedモード）。');
        break;

      case 'OFFLINE':
        if (status.fallbackRequired) {
          this.realtimeState = 'POLLING_BACKUP';
          console.log('[Dashboard Polling] 再接続限界に達したため、定時ポーリングによるバックアップ監視（Fallbackモード）を開始します。');
          if (this.isRunning && !this.intervalId && this.isTabVisible) {
            this.scheduleNext();
          }
        }
        break;
    }

    if (prevState !== this.realtimeState) {
      console.log(`[Dashboard Polling] 協調状態遷移: [${prevState}] ──> [${this.realtimeState}]`);
    }
  }
}

// グローバル公開
window.DashboardPollingController = DashboardPollingController;
