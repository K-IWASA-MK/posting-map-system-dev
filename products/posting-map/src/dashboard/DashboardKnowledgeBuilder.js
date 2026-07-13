/**
 * DashboardKnowledgeBuilder.js
 * 
 * イベントトポロジーグラフから客観的サマリー情報を合成し、
 * 表示用ナレッジオブジェクト（Knowledge Object）を生成するビルダー。
 * 
 * 警告：本ファイル内への因果（causation）推論、異常分析、自動対応ロジックの実装は厳禁である。
 */

class DashboardKnowledgeBuilder {
  /**
   * 関係トポロジーグラフのリストからナレッジデータを静的に構築する
   * @param {Array} graphs グラフリスト
   * @returns {Array} ナレッジオブジェクトリスト
   */
  static build(graphs) {
    if (!graphs || graphs.length === 0) return [];

    const knowledges = [];

    graphs.forEach(graph => {
      const knowledgeId = `know_obj_${graph.graphId}`;

      const eventIds = graph.nodes.map(n => n.eventId);
      if (eventIds.length === 0) return;

      const startNode = graph.nodes[0];
      const endNode = graph.nodes[graph.nodes.length - 1];

      const category = startNode.category || 'runtime';
      const source = startNode.source || 'Kernel';
      
      const timestampRange = {
        start: startNode.timestamp || '',
        end: endNode.timestamp || ''
      };

      // 定型メッセージの客観的構築 (推論は含まない)
      const count = eventIds.length;
      const typeLabel = graph.graphId.includes('TEMPORAL_SEQUENCE') ? 'temporal sequence' : 'attribute group';
      const summary = `Observed ${typeLabel} consisting of ${count} events. [Source: ${source}]`;

      knowledges.push({
        knowledgeId,
        eventIds,
        category,
        source,
        timestampRange,
        summary,
        metadata: {}
      });
    });

    return knowledges;
  }
}

// グローバル公開
window.DashboardKnowledgeBuilder = DashboardKnowledgeBuilder;
