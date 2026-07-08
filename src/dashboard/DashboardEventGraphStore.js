/**
 * DashboardEventGraphStore.js
 * 
 * 生成されたグラフデータを最大 100 グラフ（合計 1000 ノード上限）保持するデータストア。
 * 
 * 警告：本ファイル内への API 通信、異常判定、推奨生成ロジックの実装は厳禁である。
 */

class DashboardEventGraphStore {
  static graphs = [];
  static maxGraphs = 100;
  static maxNodes = 1000;

  /**
   * グラフオブジェクトを追加する
   * @param {object} graph 
   * @returns {boolean} 追加成功時は true, 重複時などは false
   */
  static addGraph(graph) {
    if (!graph || !graph.graphId) return false;

    // 1. 重複チェック
    const isDuplicate = this.graphs.some(g => g.graphId === graph.graphId);
    if (isDuplicate) {
      console.warn(`[Dashboard Event Graph Store] 重複登録を検知。DROP: ${graph.graphId}`);
      return false;
    }

    // 2. 厳格な不変性（Object.freeze）の適用
    const frozenGraph = Object.freeze({
      graphId: graph.graphId,
      nodes: Object.freeze((graph.nodes || []).map(n => Object.freeze({
        eventId: n.eventId,
        timestamp: n.timestamp,
        category: n.category,
        severity: n.severity,
        type: n.type
      }))),
      edges: Object.freeze((graph.edges || []).map(e => Object.freeze({
        source: e.source,
        target: e.target,
        relationType: e.relationType
      })))
    });

    this.graphs.push(frozenGraph);

    // 3. 最大上限 (100グラフ、1000ノード) スライディングウィンドウ制御
    this.applyCapacityLimit();

    return true;
  }

  /**
   * 容量上限の適用
   */
  static applyCapacityLimit() {
    // 100 グラフ制限
    if (this.graphs.length > this.maxGraphs) {
      const dropped = this.graphs.splice(0, this.graphs.length - this.maxGraphs);
      console.log(`[Dashboard Event Graph Store] グラフ上限数（100件）超過により ${dropped.length} グラフを破棄しました。`);
    }

    // 1000 ノード制限 (超えている場合は最も古いグラフを DROP)
    while (this.getTotalNodesCount() > this.maxNodes && this.graphs.length > 0) {
      const dropped = this.graphs.shift();
      console.log(`[Dashboard Event Graph Store] 合計ノード上限（1000ノード）超過により、古いグラフ ${dropped.graphId} を破棄しました。`);
    }
  }

  /**
   * 全グラフの合計ノード数を計算
   */
  static getTotalNodesCount() {
    return this.graphs.reduce((sum, g) => sum + (g.nodes ? g.nodes.length : 0), 0);
  }

  /**
   * グラフ一覧の取得
   */
  static getGraphs() {
    return this.graphs;
  }

  /**
   * ストアのクリア
   */
  static clear() {
    this.graphs = [];
    console.log('[Dashboard Event Graph Store] ストアがクリアされました。');
  }
}

// グローバル公開
window.DashboardEventGraphStore = DashboardEventGraphStore;
