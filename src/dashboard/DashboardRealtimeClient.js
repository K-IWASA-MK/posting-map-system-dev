/**
 * DashboardRealtimeClient.js
 * 
 * Server-Sent Events (SSE) を用いた一方向イベントストリーム接続クライアント。
 * コネクション管理、自動再接続、および EventBus への接続状態配信を担う。
 * 
 * 警告：本ファイル内での POST, PUT, DELETE 等の書込み処理、およびコマンド送信機能の実装は厳禁である。
 */

// 接続設定のグローバル境界管理
window.CONFIG = window.CONFIG || {};
window.CONFIG.REALTIME_ENDPOINT = window.CONFIG.REALTIME_ENDPOINT || '/api/events';

class DashboardRealtimeClient {
  static eventSource = null;
  static state = 'OFFLINE'; // CONNECTING, LIVE, OFFLINE
  static reconnectAttempts = 0;
  static maxReconnectAttempts = 5;
  static baseDelay = 2000; // 初期バックオフ 2秒
  static reconnectTimeoutId = null;
  static heartbeatTimeoutId = null;
  static heartbeatThreshold = 15000; // 15秒間疎通がない場合は切断と判断

  /**
   * ストリーム接続の開始
   */
  static connect() {
    if (this.eventSource) {
      console.log('[Dashboard Realtime] 既存の接続があるため接続要求を無視します。');
      return;
    }

    this.setState('CONNECTING');
    const endpoint = window.CONFIG.REALTIME_ENDPOINT;
    console.log(`[Dashboard Realtime] SSE エンドポイントへの接続を試みます: ${endpoint}`);

    try {
      this.eventSource = new EventSource(endpoint);

      // 接続開始成功
      this.eventSource.onopen = () => {
        console.log('[Dashboard Realtime] EventStream 接続が確立しました。');
        this.setState('LIVE');
        this.reconnectAttempts = 0;
        this.resetHeartbeat();
      };

      // メッセージ（イベント）受信時の汎用ハンドラ
      this.eventSource.onmessage = (event) => {
        this.resetHeartbeat();
        try {
          const rawEvent = JSON.parse(event.data);
          
          // ハートビート信号の個別処理
          if (rawEvent.type === 'KERNEL_HEARTBEAT' || rawEvent.type === 'HEARTBEAT') {
            console.log('[Dashboard Realtime] ハートビートを受信しました。');
            return;
          }

          // 通常イベントはアダプターを介して処理
          if (window.DashboardRealtimeAdapter) {
            window.DashboardRealtimeAdapter.handleRawEvent(rawEvent);
          }
        } catch (e) {
          console.warn('[Dashboard Realtime] 受信メッセージの解析に失敗しました:', e.message);
        }
      };

      // エラー検知 (サーバー切断やオフライン時)
      this.eventSource.onerror = (err) => {
        console.error('[Dashboard Realtime] ストリームエラーを検知しました。接続を破棄し再接続を試みます。', err);
        this.disconnect();
        this.handleReconnect();
      };
    } catch (e) {
      console.error('[Dashboard Realtime] EventSource の初期化に失敗しました:', e);
      this.setState('OFFLINE');
      this.handleReconnect();
    }
  }

  /**
   * 接続の切断とリソースのクリーンアップ
   */
  static disconnect() {
    this.setState('OFFLINE');
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId);
      this.heartbeatTimeoutId = null;
    }
    console.log('[Dashboard Realtime] 接続をクリーンに切断しました。');
  }

  /**
   * 再接続ストラテジー (指数バックオフによる自動再試行)
   */
  static handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(`[Dashboard Realtime] 再接続の最大試行回数 (${this.maxReconnectAttempts}回) に到達しました。ポーリングバックアップへ委譲します。`);
      // EventBus経由でポーリングフォールバックを促すシグナルを発行
      window.DashboardEventBus.emit('realtime-status-changed', { state: 'OFFLINE', fallbackRequired: true });
      return;
    }

    this.reconnectAttempts++;
    // 指数バックオフ計算 (例: 2s -> 4s -> 8s -> 16s -> 32s)
    const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`[Dashboard Realtime] 再接続を試行します (試行 ${this.reconnectAttempts}/${this.maxReconnectAttempts})。待機時間: ${delay}ms`);

    this.setState('CONNECTING');

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    this.reconnectTimeoutId = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * ハートビートタイムアウトの監視と自動リセット
   */
  static resetHeartbeat() {
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId);
    }

    this.heartbeatTimeoutId = setTimeout(() => {
      console.warn(`[Dashboard Realtime] 定期疎通ハートビートが ${this.heartbeatThreshold} ms 以上途絶えたため、切断とみなします。`);
      this.disconnect();
      this.handleReconnect();
    }, this.heartbeatThreshold);
  }

  /**
   * 接続状態の更新と EventBus への発行
   * @param {string} newState CONNECTING, LIVE, OFFLINE
   */
  static setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    console.log(`[Dashboard Realtime] コネクション状態遷移: ──> [${newState}]`);
    
    // UIやポーリングコントローラーへ通知
    window.DashboardEventBus.emit('realtime-status-changed', {
      state: newState,
      fallbackRequired: newState === 'OFFLINE' && this.reconnectAttempts >= this.maxReconnectAttempts
    });
  }
}

// グローバル公開
window.DashboardRealtimeClient = DashboardRealtimeClient;
