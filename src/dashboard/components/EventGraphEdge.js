/**
 * EventGraphEdge.js
 * 
 * イベント関係グラフ上の接続エッジを描画するサブコンポーネント。
 */

class EventGraphEdge {
  /**
   * エッジデータから接続線 HTML を出力する
   * @param {object} edge 
   * @param {string} maxSeverity CRITICAL / WARNING / INFO
   * @returns {string} HTML文字列
   */
  static render(edge, maxSeverity) {
    if (!edge) return '';

    let edgeClass = 'graph-edge-info';

    if (maxSeverity === 'CRITICAL') {
      edgeClass = 'graph-edge-critical'; // 赤 Glow
    } else if (maxSeverity === 'WARNING') {
      edgeClass = 'graph-edge-warning'; // オレンジ
    }

    return `
      <div class="graph-edge-wrapper" data-source="${edge.source}" data-target="${edge.target}">
        <div class="graph-edge-line ${edgeClass}" aria-hidden="true"></div>
      </div>
    `;
  }
}

// グローバル公開
window.EventGraphEdge = EventGraphEdge;
