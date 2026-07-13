/**
 * MobileKPICard.js
 * 
 * モバイル端末（2カラムグリッド配置）向けに最適化されたコンパクトな KPI パネル。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MobileKPICard {
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
   * KPIカードを描画する
   */
  static render(props) {
    const kpis = props.kpis || {};
    const maxMemoryCapacity = kpis.maxMemoryCapacity !== undefined ? kpis.maxMemoryCapacity : 1000;
    const delay = props.delay || 0;

    const activeEventsSnap = this.normalizeSnap(kpis.activeEvents, 0);
    const knowledgeRecordsSnap = this.normalizeSnap(kpis.knowledgeRecords, 0);
    const patternCountSnap = this.normalizeSnap(kpis.patternCount, 0);
    const memoryCapacitySnap = this.normalizeSnap(kpis.memoryCapacity, 0);

    const items = [
      { title: 'Events', snap: activeEventsSnap, theme: 'mobile-kpi-events', formatVal: (v) => v.toLocaleString() },
      { title: 'Knowledge', snap: knowledgeRecordsSnap, theme: 'mobile-kpi-knowledge', formatVal: (v) => v.toLocaleString() },
      { title: 'Patterns', snap: patternCountSnap, theme: 'mobile-kpi-patterns', formatVal: (v) => v.toLocaleString() },
      { title: 'Archive', snap: memoryCapacitySnap, theme: 'mobile-kpi-memory', formatVal: (v) => `${v.toLocaleString()}/${maxMemoryCapacity.toLocaleString()}` }
    ];

    let itemsHtml = '';
    items.forEach((item, i) => {
      const snap = item.snap;
      const currentValueStr = item.formatVal(snap.currentValue);

      let trendSymbol = '▶';
      let trendClass = 'm-trend-stable';
      let ratePrefix = '';

      if (snap.trendDirection === 'UP') {
        trendSymbol = '▲';
        trendClass = 'm-trend-up';
        ratePrefix = '+';
      } else if (snap.trendDirection === 'DOWN') {
        trendSymbol = '▼';
        trendClass = 'm-trend-down';
        ratePrefix = '';
      }

      const rateText = `${ratePrefix}${snap.deltaRate}%`;
      const statusClass = `m-status-lbl-${snap.statusLabel.toLowerCase()}`;

      itemsHtml += `
        <div class="mobile-kpi-box ${item.theme}" data-motion="fade-up" data-delay="${delay + (i * 50)}">
          <div class="mobile-kpi-box-title">${item.title}</div>
          <div class="mobile-kpi-box-value">${currentValueStr}</div>
          <div class="mobile-kpi-temporal-line">
            <span class="m-kpi-trend ${trendClass}">${trendSymbol} ${rateText}</span>
            <span class="m-kpi-status ${statusClass}">${snap.statusLabel}</span>
          </div>
        </div>
      `;
    });

    return `
      <section class="mobile-kpis-grid" aria-label="Mobile Key Performance Indicators">
        ${itemsHtml}
      </section>
    `;
  }
}

// グローバル公開
window.MobileKPICard = MobileKPICard;
