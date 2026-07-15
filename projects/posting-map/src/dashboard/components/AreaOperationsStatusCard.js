/**
 * AreaOperationsStatusCard.js
 * 
 * エリア (Area) 単位でのカバー率 (Coverage) 進捗度とステータスを
 * 美しいカスタムプログレスメーターで Read-Only 可視化する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class AreaOperationsStatusCard {
  /**
   * エリアオペレーションステータスカードをレンダリングする
   * @param {object} props { areaOperations, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const areas = props.areaOperations || [];
    const delay = props.delay || 0;

    let listHtml = '';
    if (areas.length === 0) {
      listHtml = `<div class="no-nodes">No Area Operations Recorded</div>`;
    } else {
      listHtml = areas.map(a => {
        return `
          <div class="area-operation-row">
            <div class="op-meta">
              <span class="op-node-id text-glow-blue">${a.areaId}</span>
            </div>
            <div class="op-stats-row">
              <span class="op-stat-item">Distribution Count: <strong class="font-mono">${a.fieldEventsCount}</strong></span>
              <span class="op-stat-item">Total Log Events: <strong class="font-mono">${a.timelineEventsCount}</strong></span>
              <span class="op-stat-item">Last Activity: <strong class="font-mono">${a.lastActivity}</strong></span>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <section class="field-operations-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Area Distribution Records</h2>
          <span class="card-subtitle">Factual Area-Level Distribution Records</span>
        </div>
        <div class="area-operations-list">
          ${listHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.AreaOperationsStatusCard = AreaOperationsStatusCard;
