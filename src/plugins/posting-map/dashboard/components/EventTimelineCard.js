/**
 * EventTimelineCard.js
 * 
 * イベント時系列ビュー（Event Timeline）を描画するプレミアムグラスカードコンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class EventTimelineCard {
  /**
   * タイムラインカードの全体レイアウトと格納データをHTML表現に変換する
   * @param {object} props 
   * @param {Array} props.events タイムラインイベントリスト
   * @param {number} props.delay レンダリング時の表示ディレイ
   * @returns {string} HTML文字列
   */
  static render(props) {
    const events = props.events || [];
    const delay = props.delay || 0;

    let itemsHtml = '';
    events.forEach((evt, i) => {
      // 1. Adapter を介したビューモデル変換
      const vm = window.DashboardTimelineAdapter.transform(evt);
      if (!vm) return;

      // 2. マーカーコンポーネントの出力
      const markerHtml = window.EventTimelineMarker.render(evt.severity);
      
      // 新着受信アイテム判定（2秒以内）
      const isNew = (Date.now() - evt.rawTimestamp) < 2000;
      const newClass = isNew ? 'timeline-item-new' : '';

      itemsHtml += `
        <div class="timeline-item ${vm.severityClass} ${newClass}">
          <div class="timeline-left">
            ${markerHtml}
            <div class="timeline-connector"></div>
          </div>
          <div class="timeline-content">
            <span class="timeline-time">${vm.timeLabel}</span>
            <span class="timeline-message">${vm.displayMessage}</span>
          </div>
        </div>
      `;
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Timeline" data-motion="fade-up" data-delay="${delay}">
        <h2>Event Timeline</h2>
        <div class="timeline-container">
          ${itemsHtml || '<p class="timeline-empty">No timeline events recorded.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventTimelineCard = EventTimelineCard;
