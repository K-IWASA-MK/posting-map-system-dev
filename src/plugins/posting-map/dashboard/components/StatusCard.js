/**
 * StatusCard.js
 * 
 * カーネルステータス可視化コンポーネント。
 * 各カーネルの Active/Idle 稼働状況をバッジ形式で描画する。
 */

class StatusCard {
  /**
   * @param {object} props 
   * @param {string} props.title タイトル (Kernel Status)
   * @param {number} props.delay 表示遅延
   * @param {object} props.statusMap 各種カーネル状態マップ (例: { execution: 'Active', review: 'Idle' })
   * @returns {string} HTML文字列
   */
  static render(props) {
    const delay = props.delay || 0;
    const s = props.statusMap || {};

    const kernels = [
      { key: 'execution', label: 'Execution', id: 'ks-execution' },
      { key: 'review', label: 'Review', id: 'ks-review' },
      { key: 'quality', label: 'Quality', id: 'ks-quality' },
      { key: 'learning', label: 'Learning', id: 'ks-learning' },
      { key: 'governance', label: 'Governance', id: 'ks-governance' },
      { key: 'billing', label: 'Billing', id: 'ks-billing' },
      { key: 'simulation', label: 'Simulation', id: 'ks-simulation' }
    ];

    let listHtml = '';
    kernels.forEach(k => {
      const status = s[k.key] || '-';
      const badgeClass = status === 'Active' ? 'badge-active' : 'badge-idle';

      listHtml += `
        <div class="status-item">
          <span>${k.label}</span>
          <span class="badge ${badgeClass}" id="${k.id}">${status}</span>
        </div>
      `;
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="${props.title}" data-motion="fade-up" data-delay="${delay}">
        <h2>${props.title}</h2>
        <div class="status-list" id="kernel-status-list">
          ${listHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.StatusCard = StatusCard;
