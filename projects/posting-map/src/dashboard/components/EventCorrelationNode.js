/**
 * EventCorrelationNode.js
 * 
 * 相関チェーン上のイベント個別ノードを表示するサブコンポーネント。
 */

class EventCorrelationNode {
  /**
   * イベントデータからノード HTML 文字列を出力する
   * @param {object} event 
   * @returns {string} HTML文字列
   */
  static render(event) {
    if (!event) return '';

    // 重要度（Severity）に連動したマーカーコンポーネントを使用
    const markerHtml = window.EventTimelineMarker ? window.EventTimelineMarker.render(event.severity) : '●';
    const timeLabel = event.timestamp || new Date().toLocaleTimeString();
    const categoryLabel = (event.category || 'runtime').toUpperCase();
    const typeName = (event.type || 'EVENT').replace(/_/g, ' ');

    return `
      <div class="correlation-node" data-event-id="${event.eventId}">
        <div class="correlation-node-header">
          ${markerHtml}
          <span class="correlation-node-title">${typeName}</span>
        </div>
        <div class="correlation-node-body">
          <span class="correlation-node-time">${timeLabel}</span>
          <span class="correlation-node-category">${categoryLabel}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.EventCorrelationNode = EventCorrelationNode;
