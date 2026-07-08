/**
 * DashboardEventBus.js
 * 
 * コントローラー、レンダラー、およびモーションレイヤー間を疎結合に保つための
 * 簡易 Publish/Subscribe イベント仲介モジュール。
 * 
 * 警告：本ファイル内へのデータ加工処理、API通信、状態変更ロジック、Kernel操作の追加は厳禁である。
 */

class DashboardEventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * イベントハンドラーを登録する
   * @param {string} event イベント名
   * @param {Function} callback コールバック関数
   */
  /**
   * イベントハンドラーを登録する
   * @param {string} event イベント名
   * @param {Function} callback コールバック関数
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    // 重複登録を防止する
    if (this.listeners[event].includes(callback)) {
      console.warn(`[Dashboard EventBus] リスナーは既に登録されています: ${event}`);
      return;
    }
    this.listeners[event].push(callback);
  }

  /**
   * イベントハンドラーを解除する
   * @param {string} event イベント名
   * @param {Function} callback コールバック関数
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * 明示的な購読解除 (offのエイリアス)
   */
  unsubscribe(event, callback) {
    this.off(event, callback);
  }

  /**
   * すべてのリスナーをクリアし、メモリ解放する
   */
  clearListeners() {
    this.listeners = {};
    console.log('[Dashboard EventBus] すべてのイベントリスナーがクリアされました。');
  }

  /**
   * リアルタイムイベントを中継・配信する
   * @param {object} mappedEvent マップ済みのUIイベントオブジェクト
   */
  publishRealtimeEvent(mappedEvent) {
    const eventName = `${mappedEvent.category}-event`;
    this.emit(eventName, mappedEvent);
    this.emit('realtime-event-received', mappedEvent);

    // タイムラインストアへの蓄積と更新通知
    if (window.DashboardEventTimelineStore) {
      const added = window.DashboardEventTimelineStore.add(mappedEvent);
      if (added) {
        const timeline = window.DashboardEventTimelineStore.getTimeline();
        this.emit('event-timeline-update', timeline);

        // コレレーション（相関関係）の抽出・構築と更新通知
        if (window.DashboardCorrelationBuilder && window.DashboardEventCorrelationStore) {
          const correlations = window.DashboardCorrelationBuilder.build(timeline);
          window.DashboardEventCorrelationStore.clear();
          correlations.forEach(corr => {
            window.DashboardEventCorrelationStore.addCorrelation(corr);
          });
          const currentCorrelations = window.DashboardEventCorrelationStore.getCorrelations();
          this.emit('event-correlation-update', currentCorrelations);

          // 関係グラフ (Event Graph) の生成・構築と更新通知
          if (window.DashboardGraphBuilder && window.DashboardEventGraphStore) {
            const graphs = window.DashboardGraphBuilder.build(currentCorrelations);
            window.DashboardEventGraphStore.clear();
            graphs.forEach(g => {
              window.DashboardEventGraphStore.addGraph(g);
            });
            const currentGraphs = window.DashboardEventGraphStore.getGraphs();
            this.emit('event-graph-update', currentGraphs);

            // 表示用ナレッジオブジェクトの生成・構築と更新通知
            if (window.DashboardKnowledgeBuilder && window.DashboardEventKnowledgeStore) {
              const knowledges = window.DashboardKnowledgeBuilder.build(currentGraphs);
              window.DashboardEventKnowledgeStore.clear();
              knowledges.forEach(k => {
                window.DashboardEventKnowledgeStore.addKnowledge(k);
              });
              const currentKnowledges = window.DashboardEventKnowledgeStore.getKnowledges();
              this.emit('event-knowledge-update', currentKnowledges);

              // 表示用インサイトオブジェクトの生成・構築と更新通知
              if (window.DashboardInsightBuilder && window.DashboardEventInsightStore) {
                const insights = window.DashboardInsightBuilder.build(currentKnowledges);
                window.DashboardEventInsightStore.clear();
                insights.forEach(ins => {
                  window.DashboardEventInsightStore.addInsight(ins);
                });
                this.emit('event-insight-update', window.DashboardEventInsightStore.getInsights());
              }
            }
          }
        }
      }
    }

    // 互換性維持のための new-activity-logs イベントへの変換・配信
    const logItem = {
      time: mappedEvent.timestamp,
      module: mappedEvent.category.charAt(0).toUpperCase() + mappedEvent.category.slice(1),
      message: mappedEvent.message,
      severity: mappedEvent.severity,
      level: mappedEvent.level
    };
    this.emit('new-activity-logs', [logItem]);
  }

  /**
   * イベントを発火し登録された購読者にデータを伝播する
   * @param {string} event イベント名
   * @param {any} data 伝播データ
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Dashboard EventBus] イベント配信エラー (${event}):`, error);
      }
    });
  }
}

// グローバルに単一のインスタンスを公開
window.DashboardEventBus = new DashboardEventBus();
