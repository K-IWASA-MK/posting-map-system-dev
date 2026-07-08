/**
 * ExecutiveKPICard.js
 * 
 * 4大 Top KPI（Active Events, Knowledge Records, Pattern Count, Memory Capacity）
 * を一括でレイアウトするコンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class ExecutiveKPICard {
  /**
   * 4大 KPI カードを描画する
   */
  static render(props) {
    const kpis = props.kpis || { activeEvents: 0, knowledgeRecords: 0, patternCount: 0, memoryCapacity: 0, maxMemoryCapacity: 1000 };
    const delay = props.delay || 0;

    const html1 = window.ExecutiveKPIElement.render({
      title: 'Active Events',
      value: kpis.activeEvents.toLocaleString(),
      subtext: 'Real-time pipeline occurrences',
      delay: delay + 50,
      categoryClass: 'kpi-events'
    });

    const html2 = window.ExecutiveKPIElement.render({
      title: 'Knowledge Records',
      value: kpis.knowledgeRecords.toLocaleString(),
      subtext: 'Structured observations archive',
      delay: delay + 100,
      categoryClass: 'kpi-knowledge'
    });

    const html3 = window.ExecutiveKPIElement.render({
      title: 'Pattern Count',
      value: kpis.patternCount.toLocaleString(),
      subtext: 'Identified recurrence clusters',
      delay: delay + 150,
      categoryClass: 'kpi-patterns'
    });

    const html4 = window.ExecutiveKPIElement.render({
      title: 'Memory Capacity',
      value: `${kpis.memoryCapacity.toLocaleString()} / ${kpis.maxMemoryCapacity.toLocaleString()}`,
      subtext: `${Math.round((kpis.memoryCapacity / kpis.maxMemoryCapacity) * 100)}% utilization active`,
      delay: delay + 200,
      categoryClass: 'kpi-memory'
    });

    return `
      <section class="executive-kpi-container" aria-label="Executive Key Performance Indicators">
        ${html1}
        ${html2}
        ${html3}
        ${html4}
      </section>
    `;
  }
}

// グローバル公開
window.ExecutiveKPICard = ExecutiveKPICard;
