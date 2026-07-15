/**
 * EventCorrelationLine.js
 * 
 * 相関ノード間を繋ぐ接続ラインを描画するサブコンポーネント。
 */

class EventCorrelationLine {
  /**
   * 最大重要度に応じた配色スタイルクラスを割り当てたライン HTML を出力する
   * @param {string} severity CRITICAL / WARNING / INFO
   * @returns {string} HTML文字列
   */
  static render(severity) {
    let lineClass = 'correlation-info';

    if (severity === 'CRITICAL') {
      lineClass = 'correlation-critical';
    } else if (severity === 'WARNING') {
      lineClass = 'correlation-warning';
    }

    return `
      <div class="correlation-line-wrapper">
        <div class="vertical-correlation-line ${lineClass}" aria-hidden="true"></div>
      </div>
    `;
  }
}

// グローバル公開
window.EventCorrelationLine = EventCorrelationLine;
