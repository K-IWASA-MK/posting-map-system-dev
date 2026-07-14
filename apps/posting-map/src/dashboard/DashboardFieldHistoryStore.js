/**
 * DashboardFieldHistoryStore.js
 * 
 * 現場データ (FieldOps) の長期履歴ログおよび
 * 時系列スナップショットデータを不変管理するデータストア。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class DashboardFieldHistoryStore {
  static history = [];
  static snapshots = [];

  /**
   * タイムライン更新イベントの購読初期化
   */
  static init() {
    if (window.DashboardEventBus) {
      window.DashboardEventBus.on('event-timeline-update', (timelineEvents) => {
        this.processHistory(timelineEvents);
      });
    }
  }

  /**
   * 現場イベントから時系列履歴およびスナップショット状態を生成
   * @param {array} timelineEvents 
   */
  static processHistory(timelineEvents) {
    const list = timelineEvents || [];
    const fieldEvents = list.filter(e => e.source === 'FIELDOPS' || e.sourceType === 'FIELDOPS');

    this.history = Object.freeze(fieldEvents.map(e => Object.freeze(e)));

    // 蓄積されたイベントをもとに、時系列スナップショット（各時刻断面の記録）を生成
    const baseTimes = ["09:00:00", "12:00:00", "15:00:00"];
    const snaps = [];

    baseTimes.forEach((time, index) => {
      const filtered = fieldEvents.filter(e => e.timestamp && e.timestamp <= time);
      const totalEvents = filtered.length;
      const coverage = Math.min(totalEvents * 10, 100); // 決定論的カバー率模擬

      snaps.push({
        snapshotId: `snap-${index + 1}`,
        timestamp: time,
        totalEvents,
        coverage
      });
    });

    this.snapshots = Object.freeze(snaps.map(s => Object.freeze(s)));
  }

  /**
   * 履歴データを取得する
   * @returns {object} Immutable History Data Object
   */
  static getHistoryData() {
    if (this.history.length === 0 && window.DashboardEventTimelineStore) {
      this.processHistory(window.DashboardEventTimelineStore.getTimeline());
    }
    return Object.freeze({
      history: this.history,
      snapshots: this.snapshots
    });
  }
}

// グローバル公開と初期化
window.DashboardFieldHistoryStore = DashboardFieldHistoryStore;
if (typeof window !== 'undefined') {
  DashboardFieldHistoryStore.init();
}
