/**
 * MobileFlowCard.js
 * 
 * モバイルの縦スクロールに配慮し、縦並びの矢印（↓）で構築された
 * 5大レイヤー（Event ➔ Timeline ➔ Knowledge ➔ Insight ➔ Memory）のパイプラインフロー進行図カード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MobileFlowCard {
  /**
   * 縦型フローカードを描画する
   */
  static render(props) {
    const flow = props.flowGraph || { event: 0, timeline: 0, knowledge: 0, insight: 0, memory: 0 };
    const delay = props.delay || 0;

    const steps = [
      { label: 'Event Input', value: flow.event, theme: 'm-flow-node-event' },
      { label: 'Timeline Store', value: flow.timeline, theme: 'm-flow-node-timeline' },
      { label: 'Knowledge Base', value: flow.knowledge, theme: 'm-flow-node-knowledge' },
      { label: 'Insight Layer', value: flow.insight, theme: 'm-flow-node-insight' },
      { label: 'Memory Archive', value: flow.memory, theme: 'm-flow-node-memory' }
    ];

    let stepsHtml = '';
    steps.forEach((step, i) => {
      stepsHtml += `
        <div class="mobile-flow-node ${step.theme}">
          <div class="mobile-flow-node-name">${step.label}</div>
          <div class="mobile-flow-node-badge">${step.value}</div>
        </div>
      `;

      if (i < steps.length - 1) {
        stepsHtml += `
          <div class="mobile-flow-arrow">
            <span class="m-arrow-symbol">↓</span>
            <span class="m-arrow-glow-line"></span>
          </div>
        `;
      }
    });

    return `
      <section class="card premium-glass" aria-label="Mobile Event Intelligence Flow" data-motion="fade-up" data-delay="${delay}">
        <h2>Pipeline Flow Graph</h2>
        <div class="mobile-flow-graph-container">
          ${stepsHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.MobileFlowCard = MobileFlowCard;
