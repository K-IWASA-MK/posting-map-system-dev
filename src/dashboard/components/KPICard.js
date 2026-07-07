/**
 * KPICard.js
 * 
 * 汎用 KPI カード・ビジュアルコンポーネント。
 * データ通信や状態計算ロジックを持たず、Props の受信と HTML 描画のみを担当する。
 */

class KPICard {
  /**
   * KPI カードの HTML をレンダリングする
   * @param {object} props 
   * @param {string} props.title カードのタイトル (例: Quality Metrics)
   * @param {number} props.delay 表示アニメーションの遅延 (ms)
   * @param {boolean} [props.gridCol2] 横幅2カラム幅にするフラグ
   * @param {Array<{label: string, value: any, unit?: string, colorClass?: string, id?: string, subText?: string, subTextId?: string}>} props.items カード内のメトリクス要素リスト
   * @returns {string} HTML文字列
   */
  static render(props) {
    const gridClass = props.gridCol2 ? 'grid-col-2' : '';
    const delay = props.delay || 0;

    let itemsHtml = '';
    props.items.forEach(item => {
      const valueIdAttr = item.id ? `id="${item.id}"` : '';
      const subIdAttr = item.subTextId ? `id="${item.subTextId}"` : '';
      const unit = item.unit || '';
      const colorClass = item.colorClass || '';
      
      itemsHtml += `
        <div class="metric-item">
          <span class="label">${item.label}</span>
          <span class="value ${colorClass}" ${valueIdAttr}>${item.value}${unit}</span>
          ${item.subText ? `<span class="sub-text" ${subIdAttr}>${item.subText}</span>` : ''}
        </div>
      `;
    });

    return `
      <section class="card premium-glass ${gridClass}" data-motion="fade-up" data-delay="${delay}">
        <h2>${props.title}</h2>
        <div class="metrics-list">
          ${itemsHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.KPICard = KPICard;
