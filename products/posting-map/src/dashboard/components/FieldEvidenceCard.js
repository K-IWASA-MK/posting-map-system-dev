/**
 * FieldEvidenceCard.js
 * 
 * 現場データ履歴から決定論的に生成された監査証跡 (Evidence Record) を
 * 読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・推論ロジックの実装は厳禁である。
 */

class FieldEvidenceCard {
  /**
   * 現場証跡カードをレンダリングする
   * @param {object} props { evidenceList, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const list = props.evidenceList || [];
    const delay = props.delay || 0;

    const rows = list.map(e => `
      <div class="evidence-row">
        <div class="evidence-meta">
          <span class="evidence-id font-mono text-glow-blue">${e.evidenceId || '-'}</span>
          <span class="evidence-generated-time font-mono">${e.generatedTime || '-'}</span>
        </div>
        <div class="evidence-details">
          <div class="evidence-detail-item">
            <span class="evidence-detail-label">Tenant</span>
            <span class="evidence-detail-value">${e.tenantId || '-'}</span>
          </div>
          <div class="evidence-detail-item">
            <span class="evidence-detail-label">Region</span>
            <span class="evidence-detail-value">${e.regionId || '-'}</span>
          </div>
          <div class="evidence-detail-item">
            <span class="evidence-detail-label">Area</span>
            <span class="evidence-detail-value">${e.areaId || '-'}</span>
          </div>
          <div class="evidence-detail-item">
            <span class="evidence-detail-label">Event Count</span>
            <span class="evidence-detail-value highlight-number font-mono">${e.eventCount || 0}</span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <section class="field-evidence-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Field Intelligence Evidence Trail</h2>
          <span class="card-subtitle">Deterministic Immutable Audit Trail Records</span>
        </div>
        <div class="evidence-list-container">
          ${rows || '<div class="no-data">No Evidence Records Found</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FieldEvidenceCard = FieldEvidenceCard;
