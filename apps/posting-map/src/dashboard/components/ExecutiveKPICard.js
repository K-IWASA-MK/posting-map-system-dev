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
  /**
   * KPIの生値またはオブジェクト構造を安全な Temporal Snapshot オブジェクトに正規化する
   */
  static normalizeSnap(snap, defaultVal = 0) {
    if (snap && typeof snap === 'object' && 'currentValue' in snap) {
      return snap;
    }
    const val = (snap !== null && snap !== undefined)
      ? (typeof snap === 'object' ? (snap.currentValue !== undefined ? snap.currentValue : defaultVal) : snap)
      : defaultVal;

    return Object.freeze({
      metricId: 'unknown',
      currentValue: val,
      previousValue: val,
      capturedAt: new Date().toISOString(),
      previousCapturedAt: new Date().toISOString(),
      delta: 0,
      deltaRate: 0,
      trendDirection: 'STABLE',
      statusLabel: 'NORMAL'
    });
  }

  /**
   * 4大 KPI カードを描画する
   */
  static render(props) {
    const kpis = props.kpis || {};
    const maxMemoryCapacity = kpis.maxMemoryCapacity !== undefined ? kpis.maxMemoryCapacity : 1000;
    const delay = props.delay || 0;

    const activeEventsSnap = this.normalizeSnap(kpis.activeEvents, 0);
    const knowledgeRecordsSnap = this.normalizeSnap(kpis.knowledgeRecords, 0);
    const patternCountSnap = this.normalizeSnap(kpis.patternCount, 0);
    const memoryCapacitySnap = this.normalizeSnap(kpis.memoryCapacity, 0);

    const html1 = window.ExecutiveKPIElement.render({
      title: 'Active Events',
      snap: activeEventsSnap,
      delay: delay + 50,
      categoryClass: 'kpi-events'
    });

    const html2 = window.ExecutiveKPIElement.render({
      title: 'Knowledge Records',
      snap: knowledgeRecordsSnap,
      delay: delay + 100,
      categoryClass: 'kpi-knowledge'
    });

    const html3 = window.ExecutiveKPIElement.render({
      title: 'Pattern Count',
      snap: patternCountSnap,
      delay: delay + 150,
      categoryClass: 'kpi-patterns'
    });

    // メモリ容量表示向けに表示文字列をラップ
    const memorySnap = Object.freeze({
      ...memoryCapacitySnap,
      currentValue: `${memoryCapacitySnap.currentValue.toLocaleString()} / ${maxMemoryCapacity.toLocaleString()}`,
      previousValue: `${memoryCapacitySnap.previousValue.toLocaleString()} / ${maxMemoryCapacity.toLocaleString()}`
    });

    const html4 = window.ExecutiveKPIElement.render({
      title: 'Memory Capacity',
      snap: memorySnap,
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
