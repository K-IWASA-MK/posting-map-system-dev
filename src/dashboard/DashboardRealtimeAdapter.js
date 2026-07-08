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

    const { eventId, timestamp, type, payload = {} } = rawEvent;

    // 2. 重複排除 (Replay 対策)
    if (this.processedEventIds.has(eventId)) {
      console.warn(`[Dashboard Realtime Adapter] 重複イベントを検知しました。DROP: ${eventId}`);
      return;
    }
    
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

    // 4. イベントタイプの分類と重要度マッピング (インテリジェンス委譲)
    const category = window.DashboardEventClassifier.classify(type);
    const severity = window.DashboardSeverityMapper.getSeverity(type);
    const level = window.DashboardSeverityMapper.getUiLevel(severity);
    const timeStr = new Date(timestamp).toLocaleTimeString();

    // 共通UIイベント構造体の構築
    const mapped = {
      eventId,
      rawTimestamp: eventTime,
      timestamp: timeStr,
      type,
      category,
      severity,
      level,
      message: payload.message || this.getDefaultMessage(type),
      payload
    };

    console.log(`[Dashboard Realtime Adapter] マッピング完了: [${type}] ➔ [${category}] (Severity: ${severity})`);

    // 5. アテンションキューへの蓄積 (優先度ソート & 容量管理)
    if (window.DashboardAttentionQueue) {
      const added = window.DashboardAttentionQueue.add(mapped);
      if (!added) return; // 重複等で破棄された場合は終了
    }

    // 6. 拡張された EventBus メソッドで発行
    if (window.DashboardEventBus && window.DashboardEventBus.publishRealtimeEvent) {
      window.DashboardEventBus.publishRealtimeEvent(mapped);
    }
  }

  /**
   * 各イベントタイプの標準メッセージを取得するヘルパー
   * @param {string} type 
   * @returns {string}
   */
  static getDefaultMessage(type) {
    switch (type) {
      case 'KERNEL_INITIALIZED': return 'Kernel Runtime initialized successfully.';
      case 'GOVERNANCE_RULE_VIOLATION': return 'Governance rule violation detected.';
      case 'GOVERNANCE_APPROVED': return 'Governance approval request confirmed.';
      case 'QUALITY_GATE_PASS': return 'Quality verification gate PASSED.';
      case 'QUALITY_GATE_FAIL': return 'Quality verification gate FAILED.';
      case 'SIMULATION_RUN_START': return 'Local Simulation execution started.';
      case 'SIMULATION_RUN_PASS': return 'Simulation completed with zero regressions.';
      case 'TRUST_BOUNDARY_ALERT': return 'Boundary violation alert! Isolation compromised.';
      default: return `System Event: ${type}`;
    }
  }
}

// グローバル公開
window.DashboardRealtimeAdapter = DashboardRealtimeAdapter;
