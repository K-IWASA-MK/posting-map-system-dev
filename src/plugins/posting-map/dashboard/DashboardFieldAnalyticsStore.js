/**
 * DashboardFieldAnalyticsStore.js
 * 
 * 現場データ (FieldOps) の時系列ログ（過去データ）を分析し、
 * 日別・月別の受信数トレンドを決定論的にキャッシュ管理するデータストア。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class DashboardFieldAnalyticsStore {
  static history = [];
  static dailyTrend = {};
  static monthlyTrend = {};

  /**
   * タイムライン更新イベントの購読初期化
   */
  static init() {
    if (window.DashboardEventBus) {
      window.DashboardEventBus.on('event-timeline-update', (timelineEvents) => {
        this.processAnalytics(timelineEvents);
      });
    }
  }

  /**
   * タイムラインイベントから日別・月別の推移を集計
   * @param {array} timelineEvents 
   */
  static processAnalytics(timelineEvents) {
    const list = timelineEvents || [];
    // 現場イベントのみを抽出
    const fieldEvents = list.filter(e => e.source === 'FIELDOPS' || e.sourceType === 'FIELDOPS');

    this.history = Object.freeze(fieldEvents.map(e => Object.freeze(e)));

    const daily = {};
    const monthly = {};

    fieldEvents.forEach(e => {
      // 安全にタイムスタンプから日付を抽出 (フォールバックあり)
      const ts = e.rawTimestamp || Date.now();
      const date = new Date(ts);
      const dailyKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const monthlyKey = dailyKey.substring(0, 7); // YYYY-MM

      daily[dailyKey] = (daily[dailyKey] || 0) + 1;
      monthly[monthlyKey] = (monthly[monthlyKey] || 0) + 1;
    });

    this.dailyTrend = Object.freeze(daily);
    this.monthlyTrend = Object.freeze(monthly);
  }

  /**
   * 集析データを取得する
   * @returns {object} Immutable Analytics Cache Object
   */
  static getAnalyticsData() {
    if (this.history.length === 0 && window.DashboardEventTimelineStore) {
      this.processAnalytics(window.DashboardEventTimelineStore.getTimeline());
    }
    return Object.freeze({
      history: this.history,
      dailyTrend: this.dailyTrend,
      monthlyTrend: this.monthlyTrend
    });
  }
}

// グローバル公開と初期化
window.DashboardFieldAnalyticsStore = DashboardFieldAnalyticsStore;
if (typeof window !== 'undefined') {
  DashboardFieldAnalyticsStore.init();
}
