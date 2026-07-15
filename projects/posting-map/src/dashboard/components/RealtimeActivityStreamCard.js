/**
 * RealtimeActivityStreamCard.js
 * 
 * 技術メッセージを非技術的・運用的な文言にルールベース要約したストリームを表示するカード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class RealtimeActivityStreamCard {
  /**
   * ストリームカードを描画する
   */
  static render(props) {
    const stream = props.activityStream || [];
    const delay = props.delay || 0;

    let itemsHtml = '';
    stream.forEach((item, i) => {
      let severityClass = '';
      if (item.severity === 'danger' || item.severity === 'CRITICAL') severityClass = 'stream-critical';
      else if (item.severity === 'warning' || item.severity === 'WARNING') severityClass = 'stream-warning';
      else if (item.severity === 'success') severityClass = 'stream-success';

      itemsHtml += `
        <div class="stream-item ${severityClass}">
          <span class="stream-time">${item.timestamp}</span>
          <span class="stream-badge stream-badge-${item.category}">${item.category}</span>
          <span class="stream-message">${item.message}</span>
        </div>
      `;
    });

    return `
      <section class="card premium-glass" aria-label="Real-time Activity Stream" data-motion="fade-up" data-delay="${delay}">
        <h2>Real-time Pipeline Activity</h2>
        <div class="activity-stream-container">
          ${itemsHtml || '<p class="stream-empty">No activity events processed yet.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.RealtimeActivityStreamCard = RealtimeActivityStreamCard;
