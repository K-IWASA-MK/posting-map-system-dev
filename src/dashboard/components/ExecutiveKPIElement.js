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
    const value = props.value !== undefined ? props.value : '-';
    const subtext = props.subtext || '';
    const delay = props.delay || 0;
    const categoryClass = props.categoryClass || 'kpi-normal';

    return `
      <div class="kpi-element premium-glass ${categoryClass}" data-motion="fade-up" data-delay="${delay}">
        <div class="kpi-element-title">${title}</div>
        <div class="kpi-element-value">${value}</div>
        ${subtext ? `<div class="kpi-element-sub">${subtext}</div>` : ''}
      </div>
    `;
  }
}

// グローバル公開
window.ExecutiveKPIElement = ExecutiveKPIElement;
