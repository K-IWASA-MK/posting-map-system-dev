/**
 * AreaIntelligenceCard.js
 * 
 * エリア (Area) 単位のデータ件数、Last Activity、および
 * 現場データ (FieldOps) の配信状態を一覧描画する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class AreaIntelligenceCard {
  /**
   * エリアインテリジェンスカードをレンダリングする
   * @param {object} props { areas, fieldEventSummary, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const areas = props.areas || [];
    const fieldEventSummary = props.fieldEventSummary || { totalFieldEvents: 0, standbyStatus: "STANDBY" };
    const delay = props.delay || 0;

    const statusClass = fieldEventSummary.standbyStatus === 'CONNECTED' ? 'text-glow-green' : 'text-glow-blue';

    let areasHtml = '';
    if (areas.length === 0) {
      areasHtml = `<div class="no-nodes">No Area Nodes Configured</div>`;
    } else {
      areasHtml = areas.map(a => `
        <div class="area-node-row">
          <div class="node-meta">
            <span class="node-id text-glow-blue">${a.areaId}</span>
            <span class="node-type">${a.areaType.toUpperCase()}</span>
          </div>
          <div class="node-stats">
            <div class="stat-cell">
              <span class="stat-lbl">Events</span>
              <span class="stat-val font-mono">${a.eventCount}</span>
            </div>
            <div class="stat-cell">
              <span class="stat-lbl">Last Activity</span>
              <span class="stat-val font-mono">${a.lastActivity}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    return `
      <section class="tenant-intelligence-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Area Intelligence Status</h2>
          <span class="card-subtitle">Detailed Area Node Activity Log</span>
        </div>
        <div class="intelligence-metric-bar">
          <div class="metric-item">
            <span class="metric-lbl">FieldOps Stream</span>
            <span class="metric-val ${statusClass}">${fieldEventSummary.standbyStatus}</span>
          </div>
          <div class="metric-item">
            <span class="metric-lbl">Field Event Total</span>
            <span class="metric-val font-mono">${fieldEventSummary.totalFieldEvents}</span>
          </div>
        </div>
        <div class="area-nodes-list">
          ${areasHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.AreaIntelligenceCard = AreaIntelligenceCard;
