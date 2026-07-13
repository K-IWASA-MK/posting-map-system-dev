/**
 * FieldOpsStatusCard.js
 * 
 * POSTING MAP 現場データ接続状態 (FieldOps Source Status) を可視化する最小限の接続確認カード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class FieldOpsStatusCard {
  static render(props) {
    const status = props.fieldOpsStatus || { providerStatus: 'STANDBY', lastActivityTime: null, totalReceivedCount: 0 };
    const delay = props.delay || 0;

    const isConnected = status.providerStatus === 'CONNECTED';
    const statusClass = isConnected ? 'status-active' : 'status-standby';
    const statusLabel = isConnected ? '● CONNECTED' : '● STANDBY';

    return `
      <section class="field-ops-status-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Field Operations Bridge</h2>
          <span class="card-subtitle">Source Status Monitor</span>
        </div>
        <div class="field-ops-status-body">
          <div class="status-indicator-wrap">
            <span class="status-indicator-badge ${statusClass}">${statusLabel}</span>
          </div>
          <div class="status-info-grid">
            <div class="status-info-item">
              <span class="info-label">Source System</span>
              <span class="info-val">POSTING MAP</span>
            </div>
            <div class="status-info-item">
              <span class="info-label">Event Category</span>
              <span class="info-val font-mono">field_operation</span>
            </div>
            <div class="status-info-item">
              <span class="info-label">Events Received</span>
              <span class="info-val font-mono">${status.totalReceivedCount}</span>
            </div>
            <div class="status-info-item">
              <span class="info-label">Last Activity</span>
              <span class="info-val">${status.lastActivityTime || 'N/A'}</span>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FieldOpsStatusCard = FieldOpsStatusCard;
