/**
 * MobileKPICard.js
 * 
 * モバイル端末（2カラムグリッド配置）向けに最適化されたコンパクトな KPI パネル。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MobileKPICard {
  /**
   * KPIカードを描画する
   */
  static render(props) {
    const kpis = props.kpis || { activeEvents: 0, knowledgeRecords: 0, patternCount: 0, memoryCapacity: 0, maxMemoryCapacity: 1000 };
    const delay = props.delay || 0;

    const items = [
      { title: 'Events', value: kpis.activeEvents.toLocaleString(), theme: 'mobile-kpi-events' },
      { title: 'Knowledge', value: kpis.knowledgeRecords.toLocaleString(), theme: 'mobile-kpi-knowledge' },
      { title: 'Patterns', value: kpis.patternCount.toLocaleString(), theme: 'mobile-kpi-patterns' },
      { title: 'Archive', value: `${kpis.memoryCapacity}/${kpis.maxMemoryCapacity}`, theme: 'mobile-kpi-memory' }
    ];

    let itemsHtml = '';
    items.forEach((item, i) => {
      itemsHtml += `
        <div class="mobile-kpi-box ${item.theme}" data-motion="fade-up" data-delay="${delay + (i * 50)}">
          <div class="mobile-kpi-box-title">${item.title}</div>
          <div class="mobile-kpi-box-value">${item.value}</div>
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
