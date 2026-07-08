/**
 * DashboardRealtimeAdapter.js
 * 
 * 受信した生ストリームイベントのスキーマ検証、Replay（重複）検知、タイムスタンプ妥当性評価、
 * および UI 用の論理イベントモデルへのマッピングを担当する。
 * 
 * 警告：本ファイル内での AI 分析、状態更新、承認処理、コマンド生成の実装は厳禁である。
 */

class DashboardRealtimeAdapter {
  static processedEventIds = new Set();
  static maxStoredEventIds = 1000;

  /**
   * 受信した生イベントを検証・マッピングし、EventBus へ引き渡す
   * @param {object} rawEvent 
   */
  static handleRawEvent(rawEvent) {
    // 1. スキーマバリデーション
    if (!rawEvent || !rawEvent.eventId || !rawEvent.timestamp || !rawEvent.type) {
      console.warn('[Dashboard Realtime Adapter] スキーマバリデーション失敗。必須項目がありません。DROP:', rawEvent);
      return;
    }

    const { eventId, timestamp, type, payload } = rawEvent;

    // 2. 重複排除 (Replay 対策)
    if (this.processedEventIds.has(eventId)) {
      console.warn(`[Dashboard Realtime Adapter] 重複イベントを検知しました。DROP: ${eventId}`);
      return;
    }
    
    // 履歴ストア管理 (最大件数オーバー時は古いものから消去)
    if (this.processedEventIds.size >= this.maxStoredEventIds) {
      const firstKey = this.processedEventIds.values().next().value;
      this.processedEventIds.delete(firstKey);
    }
    this.processedEventIds.add(eventId);

    // 3. タイムスタンプ検証 (Timestamp Validation)
    const eventTime = new Date(timestamp).getTime();
    const currentTime = Date.now();

    if (isNaN(eventTime)) {
      console.warn(`[Dashboard Realtime Adapter] 不正な日付フォーマットです。DROP: ${timestamp}`);
      return;
    }

    const fiveMinutes = 5 * 60 * 1000;
    const oneMinute = 1 * 60 * 1000;

    if (currentTime - eventTime > fiveMinutes) {
      console.warn(`[Dashboard Realtime Adapter] 古すぎるイベントです（5分以上過去）。DROP: ${timestamp}`);
      return;
    }
    if (eventTime - currentTime > oneMinute) {
      console.warn(`[Dashboard Realtime Adapter] 未来すぎるイベントです（1分以上未来）。DROP: ${timestamp}`);
      return;
    }

    // 4. イベントタイプのマッピング
    const mapped = this.mapToUiEvent(type, payload, timestamp);
    if (!mapped) {
      console.log(`[Dashboard Realtime Adapter] マップ対象外のイベントタイプです: ${type}`);
      return;
    }

    console.log(`[Dashboard Realtime Adapter] イベントをマッピングしました [${type}] ──> [${mapped.category}]`);

    // 5. 拡張された EventBus メソッドで発行
    if (window.DashboardEventBus && window.DashboardEventBus.publishRealtimeEvent) {
      window.DashboardEventBus.publishRealtimeEvent(mapped);
    }
  }

  /**
   * 生のカーネルイベントタイプをUI表示用のモデルにマッピングする
   * @returns {object|null}
   */
  static mapToUiEvent(type, payload = {}, timestamp) {
    const timeStr = new Date(timestamp).toLocaleTimeString();
    
    switch (type) {
      case 'KERNEL_INITIALIZED':
        return {
          category: 'runtime',
          level: 'success',
          type: type,
          message: 'Kernel Runtime initialized successfully.',
          timestamp: timeStr,
          payload: payload
        };
      
      case 'GOVERNANCE_RULE_VIOLATION':
        return {
          category: 'governance',
          level: 'warning',
          type: type,
          message: payload.message || 'Governance rule violation detected.',
          timestamp: timeStr,
          payload: payload
        };

      case 'GOVERNANCE_APPROVED':
        return {
          category: 'governance',
          level: 'success',
          type: type,
          message: payload.message || 'Governance approval request confirmed.',
          timestamp: timeStr,
          payload: payload
        };

      case 'QUALITY_GATE_PASS':
        return {
          category: 'quality',
          level: 'success',
          type: type,
          message: 'Quality verification gate PASSED.',
          timestamp: timeStr,
          payload: payload
        };

      case 'QUALITY_GATE_FAIL':
        return {
          category: 'quality',
          level: 'danger',
          type: type,
          message: payload.message || 'Quality verification gate FAILED.',
          timestamp: timeStr,
          payload: payload
        };

      case 'SIMULATION_RUN_START':
        return {
          category: 'simulation',
          level: 'info',
          type: type,
          message: 'Local Simulation execution started.',
          timestamp: timeStr,
          payload: payload
        };

      case 'SIMULATION_RUN_PASS':
        return {
          category: 'simulation',
          level: 'success',
          type: type,
          message: 'Simulation completed with zero regressions.',
          timestamp: timeStr,
          payload: payload
        };

      case 'TRUST_BOUNDARY_ALERT':
        return {
          category: 'trust',
          level: 'danger',
          type: type,
          message: payload.message || 'Boundary violation alert! Isolation compromised.',
          timestamp: timeStr,
          payload: payload
        };

      default:
        return null;
    }
  }
}

// グローバル公開
window.DashboardRealtimeAdapter = DashboardRealtimeAdapter;
