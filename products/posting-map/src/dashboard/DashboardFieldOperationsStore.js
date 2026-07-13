/**
 * DashboardFieldOperationsStore.js
 * 
 * 現場データ (FieldOps) の受信イベントのみを排他フィルタリングして
 * 時系列に不変キャッシュ管理するデータストア。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class DashboardFieldOperationsStore {
  static events = [];

  /**
   * タイムライン更新イベントの購読初期化
   */
  static init() {
    if (window.DashboardEventBus) {
      window.DashboardEventBus.on('event-timeline-update', (timelineEvents) => {
        this.updateFieldEvents(timelineEvents);
      });
    }
  }

  /**
   * 受信した全タイムラインから現場イベントのみを抽出・不変同期
   * @param {array} timelineEvents 
   */
  static updateFieldEvents(timelineEvents) {
    const list = timelineEvents || [];
    const fieldEvents = list.filter(e => e.source === 'FIELDOPS' || e.sourceType === 'FIELDOPS');
    this.events = Object.freeze(fieldEvents.map(e => Object.freeze(e)));
  }

  /**
   * 現場イベントリストを取得する
   * @returns {array} Immutable FieldOps Events
   */
  static getEvents() {
    if (this.events.length === 0 && window.DashboardEventTimelineStore) {
      this.updateFieldEvents(window.DashboardEventTimelineStore.getTimeline());
    }
    return this.events;
  }
}

// グローバル公開と初期化
window.DashboardFieldOperationsStore = DashboardFieldOperationsStore;
if (typeof window !== 'undefined') {
  DashboardFieldOperationsStore.init();
}
