/**
 * EventGraphNode.js
 * 
 * イベント関係グラフ上の各ノードを描画するサブコンポーネント。
 */

class EventGraphNode {
  /**
   * ノードオブジェクトから HTML 文字列を生成する
   * @param {object} node 
   * @returns {string} HTML文字列
   */
  static render(node) {
    if (!node) return '';

    const labelText = (node.label || node.type || 'EVENT').replace(/_/g, ' ');
    const severity = node.severity || 'INFO';
    const timeLabel = node.timestamp || '';

    let severityClass = 'graph-node-info';
    let marker = '⚪';

    if (severity === 'CRITICAL') {
      severityClass = 'graph-node-critical'; // 赤色 + 赤 Glow
      marker = '🔴';
    } else if (severity === 'WARNING') {
      severityClass = 'graph-node-warning'; // オレンジ
      marker = '🟠';
    }

    return `
      <div class="graph-node ${severityClass}" data-event-id="${node.eventId}">
        <div class="graph-node-header">
          <span class="graph-node-marker">${marker}</span>
          <span class="graph-node-label">${labelText}</span>
        </div>
        <div class="graph-node-body">
          <span class="graph-node-time">${timeLabel}</span>
          <span class="graph-node-category">${(node.category || 'runtime').toUpperCase()}</span>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.EventGraphNode = EventGraphNode;
