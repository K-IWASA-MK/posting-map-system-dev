/**
 * DashboardAttentionQueue.js
 * 
 * リアルタイムイベントを重要度順 (CRITICAL ➔ WARNING ➔ INFO) にソートして上位を保持するアテンションキュー。
 * 重複登録の防止、最大保持数制限 (50件) を備える。
 * 
 * 警告：本ファイル内への承認処理（approve）、実行（execute/resolve）などのコマンド逆流処理の実装は厳禁である。
 */

class DashboardAttentionQueue {
  static queue = [];
  static maxCapacity = 50;

  /**
   * イベントをキューに安全に追加し、重要度順にソートする
   * @param {object} event 
   * @returns {boolean} 登録成功時は true, 重複時などは false
   */
  static add(event) {
    if (!event || !event.eventId) return false;

    // 1. 二重の重複排除ガード
    const isDuplicate = this.queue.some(item => item.eventId === event.eventId);
    if (isDuplicate) {
      console.warn(`[Dashboard Attention Queue] 重複登録を検知。DROP: ${event.eventId}`);
      return false;
    }

    // 2. 元データの不変性（Immutability）を担保するため Object.freeze
    const frozenEvent = Object.freeze({
      eventId: event.eventId,
      severity: event.severity || 'INFO',
      category: event.category || 'runtime',
      level: event.level || 'info',
      message: event.message || '',
      timestamp: event.timestamp || new Date().toLocaleTimeString(),
      rawTimestamp: event.rawTimestamp || Date.now(), // 厳密なソート用
      payload: event.payload ? Object.freeze({ ...event.payload }) : {}
    });

    // 3. 配列追加
    this.queue.push(frozenEvent);

    // 4. 重要度（CRITICAL ➔ WARNING ➔ INFO）および時間順での優先度ソート
    this.sortQueue();

    // 5. 容量制限（50件）の適用
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 優先順位ソート処理
   */
  static sortQueue() {
    const severityWeight = {
      'CRITICAL': 3,
      'WARNING': 2,
      'INFO': 1
    };

    this.queue.sort((a, b) => {
      // 1. 重要度の重みで降順ソート
      const weightA = severityWeight[a.severity] || 1;
      const weightB = severityWeight[b.severity] || 1;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      // 2. 同一重要度の場合は、時間が新しい順 (降順)
      return b.rawTimestamp - a.rawTimestamp;
    });
  }

  /**
   * 上限件数（50件）を超過した古い・重要度の低いログの破棄
   */
  static applyCapacityLimit() {
    if (this.queue.length > this.maxCapacity) {
      const dropped = this.queue.splice(this.maxCapacity);
      console.log(`[Dashboard Attention Queue] 容量上限を超過したため ${dropped.length} 件を破棄しました。`);
    }
  }

  /**
   * キュー配列の取得
   */
  static getQueue() {
    return this.queue;
  }

  /**
   * 全クリア
   */
  static clear() {
    this.queue = [];
    console.log('[Dashboard Attention Queue] キューがクリアされました。');
  }
}

// グローバル公開
window.DashboardAttentionQueue = DashboardAttentionQueue;
