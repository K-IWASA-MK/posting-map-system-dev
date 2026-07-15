/**
 * FlyerHoldingsCard.js
 * 
 * チラシ保管状況 (Flyer Holdings) のユーザー入力による事実データを
 * 読み取り専用で表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、自動対応、自動減算、および AI 予測・推論ロジックの実装は厳禁である。
 */

class FlyerHoldingsCard {
  /**
   * チラシ保管者別保有枚数カードをレンダリングする
   * @param {object} props { inventories, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const list = props.inventories || [];
    const delay = props.delay || 0;

    const rows = list.map(i => {
      const dateStr = i.lastUpdatedAt ? new Date(i.lastUpdatedAt).toLocaleString('ja-JP') : '未更新';
      return `
        <div class="evidence-row">
          <div class="evidence-meta">
            <span class="evidence-id font-mono text-glow-blue">${i.holderId || '-'}</span>
            <span class="evidence-generated-time font-mono">Updated: ${dateStr}</span>
          </div>
          <div class="evidence-details">
            <div class="evidence-detail-item">
              <span class="evidence-detail-label">Flyer Name</span>
              <span class="evidence-detail-value">${i.flyerName || i.flyerId || '-'}</span>
            </div>
            <div class="evidence-detail-item">
              <span class="evidence-detail-label">Holder Type</span>
              <span class="evidence-detail-value">${i.holderType || '-'}</span>
            </div>
            <div class="evidence-detail-item">
              <span class="evidence-detail-label">Current Stock</span>
              <span class="evidence-detail-value highlight-number font-mono text-glow-orange">${i.currentStock.toLocaleString()} 枚</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <section class="field-evidence-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Flyer Holdings Status</h2>
          <span class="card-subtitle">User-Inputted Factual Inventory Stocks</span>
        </div>
        <div class="evidence-list-container">
          ${rows || '<div class="no-data">No Flyer Holdings Logged</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FlyerHoldingsCard = FlyerHoldingsCard;
