/**
 * ExecutiveKPIElement.js
 * 
 * 個々の Top KPI数値を描画するプレミアムグラスタイル。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class ExecutiveKPIElement {
  /**
   * KPI単体を描画する
   */
  static render(props) {
    const title = props.title || '';
    const snap = props.snap || { currentValue: 0, previousValue: 0, delta: 0, deltaRate: 0, trendDirection: 'STABLE', statusLabel: 'NORMAL' };
    const delay = props.delay || 0;
    const categoryClass = props.categoryClass || 'kpi-normal';

    const currentValueStr = typeof snap.currentValue === 'number' ? snap.currentValue.toLocaleString() : (snap.currentValue || '-');
    const previousValueStr = typeof snap.previousValue === 'number' ? snap.previousValue.toLocaleString() : (snap.previousValue || '-');

    let trendSymbol = '▶';
    let trendClass = 'trend-stable';
    let ratePrefix = '';

    if (snap.trendDirection === 'UP') {
      trendSymbol = '▲';
      trendClass = 'trend-up';
      ratePrefix = '+';
    } else if (snap.trendDirection === 'DOWN') {
      trendSymbol = '▼';
      trendClass = 'trend-down';
      ratePrefix = '';
    }

    const rateText = `${ratePrefix}${snap.deltaRate}%`;
    const statusClass = `status-lbl-${snap.statusLabel.toLowerCase()}`;

    return `
      <div class="kpi-element premium-glass ${categoryClass}" data-motion="fade-up" data-delay="${delay}">
        <div class="kpi-element-title">${title}</div>
        <div class="kpi-element-value">${currentValueStr}</div>
        
        <div class="kpi-element-temporal-row">
          <span class="kpi-trend-badge ${trendClass}">${trendSymbol} ${rateText}</span>
          <span class="kpi-prev-text">Prev: ${previousValueStr}</span>
        </div>
        
        <div class="kpi-status-container">
          <span class="kpi-status-badge ${statusClass}">${snap.statusLabel}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.ExecutiveKPIElement = ExecutiveKPIElement;
