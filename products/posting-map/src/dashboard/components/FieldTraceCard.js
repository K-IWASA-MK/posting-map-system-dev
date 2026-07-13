/**
 * FieldTraceCard.js
 * 
 * レコード間の因果関係・由来 (Traceability) を決定論的に生成された
 * マップ情報として読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class FieldTraceCard {
  /**
   * 現場追跡カードをレンダリングする
   * @param {object} props { traceList, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const list = props.traceList || [];
    const delay = props.delay || 0;

    const rows = list.map(t => `
      <div class="trace-row">
        <div class="trace-meta">
          <span class="trace-id font-mono text-glow-blue">${t.traceId || '-'}</span>
        </div>
        <div class="trace-details">
          <div class="trace-detail-item">
            <span class="trace-detail-label">Audit ID</span>
            <span class="trace-detail-value font-mono">${t.auditId || '-'}</span>
          </div>
          <div class="trace-detail-item">
            <span class="trace-detail-label">Evidence ID</span>
            <span class="trace-detail-value font-mono">${t.evidenceId || '-'}</span>
          </div>
          <div class="trace-detail-item">
            <span class="trace-detail-label">History ID</span>
            <span class="trace-detail-value font-mono truncate-text" title="${t.historyId || '-'}">${t.historyId || '-'}</span>
          </div>
          <div class="trace-detail-item">
            <span class="trace-detail-label">Timeline ID</span>
            <span class="trace-detail-value font-mono truncate-text" title="${t.timelineId || '-'}">${t.timelineId || '-'}</span>
          </div>
          <div class="trace-detail-item flex-row-item">
            <div class="trace-sub-detail">
              <span class="trace-detail-label">Tenant</span>
              <span class="trace-detail-value">${t.tenantId || '-'}</span>
            </div>
            <div class="trace-sub-detail">
              <span class="trace-detail-label">Region</span>
              <span class="trace-detail-value">${t.regionId || '-'}</span>
            </div>
            <div class="trace-sub-detail">
              <span class="trace-detail-label">Area</span>
              <span class="trace-detail-value">${t.areaId || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <section class="field-trace-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Field Intelligence Traceability Ledger</h2>
          <span class="card-subtitle">Deterministic Immutable Lineage Maps Across Operational Traces</span>
        </div>
        <div class="trace-list-container">
          ${rows || '<div class="no-data">No Traceability Maps Found</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FieldTraceCard = FieldTraceCard;
