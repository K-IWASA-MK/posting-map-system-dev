/**
 * IntelligenceFlowGraphCard.js
 * 
 * Event ➔ Timeline ➔ Correlation ➔ Graph ➔ Knowledge ➔ Insight ➔ Evolution ➔ Pattern ➔ Memory
 * のデータ変換パイプラインの循環構造と現在処理件数を可視化するカード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class IntelligenceFlowGraphCard {
  /**
   * フローグラフカードを描画する
   */
  static render(props) {
    const flow = props.flowGraph || { event: 0, timeline: 0, correlation: 0, graph: 0, knowledge: 0, insight: 0, evolution: 0, pattern: 0, memory: 0 };
    const delay = props.delay || 0;

    const steps = [
      { key: 'event', label: 'Event', value: flow.event, theme: 'flow-node-event' },
      { key: 'timeline', label: 'Timeline', value: flow.timeline, theme: 'flow-node-timeline' },
      { key: 'correlation', label: 'Correlation', value: flow.correlation, theme: 'flow-node-correlation' },
      { key: 'graph', label: 'Graph', value: flow.graph, theme: 'flow-node-graph' },
      { key: 'knowledge', label: 'Knowledge', value: flow.knowledge, theme: 'flow-node-knowledge' },
      { key: 'insight', label: 'Insight', value: flow.insight, theme: 'flow-node-insight' },
      { key: 'evolution', label: 'Evolution', value: flow.evolution, theme: 'flow-node-evolution' },
      { key: 'pattern', label: 'Pattern', value: flow.pattern, theme: 'flow-node-pattern' },
      { key: 'memory', label: 'Memory', value: flow.memory, theme: 'flow-node-memory' }
    ];

    let stepsHtml = '';
    steps.forEach((step, i) => {
      stepsHtml += `
        <div class="flow-node ${step.theme}">
          <div class="flow-node-badge">${step.value}</div>
          <div class="flow-node-name">${step.label}</div>
        </div>
      `;

      if (i < steps.length - 1) {
        stepsHtml += `
          <div class="flow-arrow">
            <span class="arrow-symbol">➔</span>
            <span class="arrow-glow-line"></span>
          </div>
        `;
      }
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Intelligence Flow Graph" data-motion="fade-up" data-delay="${delay}">
        <h2>Event Intelligence Pipeline Flow</h2>
        <div class="flow-graph-container">
          ${stepsHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.IntelligenceFlowGraphCard = IntelligenceFlowGraphCard;
