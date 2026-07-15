/**
 * MobileActivityCard.js
 * 
 * スマホの横幅に合わせてメッセージがトリミングされた、
 * タッチフレンドリーな活動履歴ストリームカード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MobileActivityCard {
  /**
   * 活動カードを描画する
   */
  static render(props) {
    const stream = props.activityStream || [];
    const delay = props.delay || 0;

    let itemsHtml = '';
    stream.forEach((item, i) => {
      let severityClass = '';
      if (item.severity === 'danger' || item.severity === 'CRITICAL') severityClass = 'mobile-stream-critical';
      else if (item.severity === 'warning' || item.severity === 'WARNING') severityClass = 'mobile-stream-warning';
      else if (item.severity === 'success') severityClass = 'mobile-stream-success';

      itemsHtml += `
        <div class="mobile-stream-item ${severityClass}">
          <div class="mobile-stream-meta-line">
            <span class="mobile-stream-time">${item.timestamp}</span>
            <span class="mobile-stream-badge badge-${item.category.toLowerCase()}">${item.category}</span>
          </div>
          <div class="mobile-stream-message">${item.message}</div>
        </div>
      `;
    });

    return `
      <section class="card premium-glass" aria-label="Mobile Pipeline Activity" data-motion="fade-up" data-delay="${delay}">
        <h2>Pipeline Activity</h2>
        <div class="mobile-activity-stream-container">
          ${itemsHtml || '<p class="mobile-stream-empty">No activity events processed yet.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.MobileActivityCard = MobileActivityCard;
