/**
 * FieldHistoryTimelineCard.js
 * 
 * 過去のすべての現場活動イベントを時系列のタイムライン形式で
 * 美しく Read-Only 一覧表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class FieldHistoryTimelineCard {
  /**
   * 現場履歴タイムラインカードをレンダリングする
   * @param {object} props { historyTimeline, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const timeline = props.historyTimeline || [];
    const delay = props.delay || 0;

    const rows = timeline.slice().reverse().slice(0, 10).map(e => `
      <div class="history-timeline-row">
        <span class="history-time font-mono">${e.timestamp || '-'}</span>
        <span class="history-area-tag text-glow-blue font-mono">${e.areaId || 'DEFAULT'}</span>
        <span class="history-msg">${e.message || 'Operational stream activity recorded'}</span>
      </div>
    `).join('');

    return `
      <section class="field-history-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Field Activity History Timeline</h2>
          <span class="card-subtitle">Chronological Operational Traceability Logs</span>
        </div>
        <div class="history-timeline-list">
          ${rows || '<div class="no-data">No Field Activities Recorded</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.FieldHistoryTimelineCard = FieldHistoryTimelineCard;
