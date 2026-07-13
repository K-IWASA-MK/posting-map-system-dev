/**
 * ActivityLogCard.js
 * 
 * システム活動ログ用ビジュアルコンポーネント。
 * データ加工、API通信、ログ追加などは行わず、受け取った Props 配列をリスト形式で静的描画する。
 */

class ActivityLogCard {
  /**
   * @param {object} props 
   * @param {Array<{time: string, module: string, message: string}>} props.logs 時系列活動ログの配列
   * @param {number} props.delay トランジション遅延
   * @returns {string} HTML文字列
   */
  static render(props) {
    const logs = props.logs || [
      { time: '22:45:10', module: 'Simulation', message: 'Local Simulation PASS' },
      { time: '22:43:08', module: 'Quality', message: 'Regression audit PASS' },
      { time: '22:40:01', module: 'Governance', message: 'Boundary protection check active' }
    ];
    const delay = props.delay || 0;

    let listHtml = '';
    logs.forEach((log, i) => {
      // 先頭（最新）ログのみオレンジ発光（Glow）クラスをアタッチする
      const glowClass = i === 0 ? 'new-log-glow' : '';
      const itemDelay = delay + i * 50;

      let severityClass = '';
      if (log.severity === 'CRITICAL') {
        severityClass = 'log-critical';
      } else if (log.severity === 'WARNING') {
        severityClass = 'log-warning';
      }

      listHtml += `
        <li class="log-item ${glowClass} ${severityClass}" data-motion="log-fade" data-delay="${itemDelay}">
          <span class="log-time">${log.time}</span>
          <span class="log-module">${log.module}</span>
          <span class="log-message">${log.message}</span>
        </li>
      `;
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="System Activity Log" data-motion="fade-up" data-delay="${delay}">
        <h2>System Activity Log</h2>
        <div class="log-container">
          <ul class="log-list" aria-live="polite">
            ${listHtml}
          </ul>
        </div>
      </section>
    `;
  }

  /**
   * 単一のログ項目 HTML を生成する (差分 Prepend 用)
   * @param {object} log 
   * @param {number} delay 
   * @returns {string}
   */
  static renderItem(log, delay = 0) {
    let severityClass = '';
    if (log.severity === 'CRITICAL') {
      severityClass = 'log-critical';
    } else if (log.severity === 'WARNING') {
      severityClass = 'log-warning';
    }

    return `
      <li class="log-item new-log-glow ${severityClass}" data-motion="log-fade" data-delay="${delay}">
        <span class="log-time">${log.time}</span>
        <span class="log-module">${log.module}</span>
        <span class="log-message">${log.message}</span>
      </li>
    `;
  }
}

// グローバル公開
window.ActivityLogCard = ActivityLogCard;
