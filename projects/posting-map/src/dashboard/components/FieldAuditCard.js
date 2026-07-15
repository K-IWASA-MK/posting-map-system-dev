/**
 * FieldAuditCard.js
 * 
 * 証跡データから決定論的に生成された監査対象レコード (Audit Record) を
 * 読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・推論・判断ロジックの実装は厳禁である。
 */

class FieldAuditCard {
  /**
   * 現場監査カードをレンダリングする
   * @param {object} props { auditList, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const list = props.auditList || [];
    const delay = props.delay || 0;

    const rows = list.map(a => `
      <div class="audit-row">
        <div class="audit-meta">
          <span class="audit-id font-mono text-glow-blue">${a.auditId || '-'}</span>
          <span class="audit-time font-mono">${a.auditTime || '-'}</span>
        </div>
        <div class="audit-details">
          <div class="audit-detail-item">
            <span class="audit-detail-label">Evidence ID</span>
            <span class="audit-detail-value font-mono">${a.evidenceId || '-'}</span>
          </div>
          <div class="audit-detail-item">
            <span class="audit-detail-label">Tenant</span>
            <span class="audit-detail-value">${a.tenantId || '-'}</span>
          </div>
          <div class="audit-detail-item">
            <span class="audit-detail-label">Region</span>
            <span class="audit-detail-value">${a.regionId || '-'}</span>
          </div>
          <div class="audit-detail-item">
            <span class="audit-detail-label">Area</span>
            <span class="audit-detail-value">${a.areaId || '-'}</span>
          </div>
          <div class="audit-detail-item">
            <span class="audit-detail-label">Event Count</span>
            <span class="audit-detail-value highlight-number font-mono">${a.eventCount || 0}</span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <section class="field-audit-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Field Intelligence Audit Ledger</h2>
          <span class="card-subtitle">Deterministic Immutable Operational Audit Records</span>
        </div>
        <div class="audit-list-container">
          ${rows || '<div class="no-data">No Operational Audit Records Found</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FieldAuditCard = FieldAuditCard;
