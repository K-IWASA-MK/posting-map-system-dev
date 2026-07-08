/**
 * EventGraphCard.js
 * 
 * 構築されたイベント関係グラフ群を可視化する premium-glass カードコンポーネント。
 * 
 * 警告：本ファイル内への推論ロジック、自動対応、および button 等の操作用要素の実装は厳禁である。
 */

class EventGraphCard {
  /**
   * グラフストア内のデータ配列から HTML 文字列を出力する
   * @param {object} props 
   * @param {Array} props.graphs グラフ構造リスト
   * @param {number} props.delay 遅延時間
   * @returns {string} HTML文字列
   */
  static render(props) {
    const graphs = props.graphs || [];
    const delay = props.delay || 0;

    let itemsHtml = '';

    graphs.forEach(graph => {
      let flowHtml = '';

      graph.nodes.forEach((node, idx) => {
        // ノードレンダリング
        const nodeHtml = window.EventGraphNode.render(node);

        // 次のノードとのエッジレンダリング (最後のノード以外)
        let edgeHtml = '';
        if (idx < graph.nodes.length - 1) {
          const nextNode = graph.nodes[idx + 1];
          const matchedEdge = graph.edges.find(e => e.source === node.eventId && e.target === nextNode.eventId);
          if (matchedEdge) {
            // 最高重要度の算出
            const highestSeverity = (node.severity === 'CRITICAL' || nextNode.severity === 'CRITICAL') ? 'CRITICAL' :
                                    (node.severity === 'WARNING' || nextNode.severity === 'WARNING') ? 'WARNING' : 'INFO';
            
            edgeHtml = window.EventGraphEdge.render(matchedEdge, highestSeverity);
          }
        }

        flowHtml += `
          ${nodeHtml}
          ${edgeHtml}
        `;
      });

      // 最新ノードの時刻に基づく新着検知 (簡易的)
      const isNew = graph.nodes.length > 0; // 最新であるとみなしアニメーション付与
      const newClass = isNew ? 'event-graph-item-new' : '';

      itemsHtml += `
        <div class="event-graph-item ${newClass}">
          <div class="event-graph-meta">
            <span class="event-graph-id-badge">${graph.graphId}</span>
            <span class="event-graph-node-count">${graph.nodes.length} Nodes</span>
          </div>
          <div class="event-graph-flow">
            ${flowHtml}
          </div>
        </div>
      `;
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Topology Graph" data-motion="fade-up" data-delay="${delay}">
        <h2>Event Topology Graph</h2>
        <div class="event-graph">
          ${itemsHtml || '<p class="event-graph-empty">No relationship graphs mapped.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventGraphCard = EventGraphCard;
