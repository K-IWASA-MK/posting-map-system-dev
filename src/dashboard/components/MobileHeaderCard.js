/**
 * MobileHeaderCard.js
 * 
 * スマートフォンの画面幅に適合させたコンパクトな監視ステータスヘッダー。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class MobileHeaderCard {
  /**
   * モバイル用ヘッダーを描画する
   */
  static render(props) {
    const statusState = props.statusState || 'ONLINE';
    const timestamp = props.timestamp || new Date().toLocaleTimeString();
    const delay = props.delay || 0;

    return `
      <header class="mobile-header-panel premium-glass" data-motion="slide-down" data-delay="${delay}">
        <div class="mobile-header-title-wrap">
          <h1>AIOS Mobile Monitor</h1>
        </div>
        <div class="mobile-header-status-wrap">
          <span id="mobile-status-badge" class="mobile-status-badge status-${statusState.toLowerCase()}">
            ● ${statusState}
          </span>
          <span class="mobile-header-time">${timestamp}</span>
        </div>
      </header>
    `;
  }
}

// グローバル公開
window.MobileHeaderCard = MobileHeaderCard;
