/**
 * EventTimelineMarker.js
 * 
 * イベントの重要度（Severity）に適合したマーカー部分を描画するサブコンポーネント。
 */

class EventTimelineMarker {
  /**
   * 重要度に応じたマーカーの HTML 文字列を出力する
   * @param {string} severity CRITICAL / WARNING / INFO
   * @returns {string}
   */
  static render(severity) {
    let markerClass = 'timeline-info';
    let symbol = '⚪';

    if (severity === 'CRITICAL') {
      markerClass = 'timeline-critical';
      symbol = '🔴';
    } else if (severity === 'WARNING') {
      markerClass = 'timeline-warning';
      symbol = '🟠';
    }

    return `<span class="timeline-marker ${markerClass}" aria-hidden="true" data-severity="${severity}">${symbol}</span>`;
  }
}

// グローバル公開
window.EventTimelineMarker = EventTimelineMarker;
