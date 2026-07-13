/**
 * DashboardGraphBuilder.js
 * 
 * 抽出された相関（Correlation）データから、
 * トポロジーを表現する関係グラフ（Event Graph）を構築するビルダー。
 * 
 * 警告：本ファイル内への因果（causation）推論、成功失敗分析、異常検出ロジックの実装は厳禁である。
 */

class DashboardGraphBuilder {
  /**
   * 相関チェーン群からグラフ構造オブジェクトのリストを生成する
   * @param {Array} correlations 相関データリスト
   * @returns {Array} グラフオブジェクトリスト
   */
  static build(correlations) {
    if (!correlations || correlations.length === 0) return [];

    // イベント詳細を逆引きするため Timeline ストアから取得
    const allEvents = window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline() : [];

    const graphs = [];

    correlations.forEach(corr => {
      const graphId = `graph_${corr.correlationId}`;

      // イベント実体を逆引き
      const matchedEvents = corr.eventIds
        .map(id => allEvents.find(e => e.eventId === id))
        .filter(Boolean)
        .sort((a, b) => a.rawTimestamp - b.rawTimestamp); // 昇順 (古い順)

      if (matchedEvents.length < 2) return;

      // 1. ノードリストの作成
      const nodes = matchedEvents.map(evt => ({
        eventId: evt.eventId,
        timestamp: evt.timestamp,
        category: evt.category || 'runtime',
        severity: evt.severity || 'INFO',
        type: evt.type || 'EVENT'
      }));

      // 2. 隣接ノード同士を接続するエッジリストの作成
      const edges = [];
      for (let i = 0; i < matchedEvents.length - 1; i++) {
        edges.push({
          source: matchedEvents[i].eventId,
          target: matchedEvents[i + 1].eventId,
          relationType: corr.relationType // TEMPORAL_SEQUENCE, CATEGORY_GROUP 等
        });
      }

      graphs.push({
        graphId,
        nodes,
        edges
      });
    });

    return graphs;
  }
}

// グローバル公開
window.DashboardGraphBuilder = DashboardGraphBuilder;
