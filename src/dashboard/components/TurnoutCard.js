/**
 * TurnoutCard.js
 * 
 * 投票率情報表示用ビジュアルコンポーネント。
 * 通信や当落予測などの依存を一切持たず、Props から Glass UI に基づく投票率の表示カード HTML を生成する。
 */

class TurnoutCard {
  /**
   * @param {object} props 
   * @param {number} props.overall 全体投票率実績値
   * @param {Array<{city: string, turnoutRate: number, status: string}>} props.cities 各市区町村別投票率配列
   * @param {number} props.delay 表示遅延
   * @returns {string} HTML文字列
   */
  static render(props) {
    const overall = props.overall || 0;
    const cities = props.cities || [];
    const delay = props.delay || 0;

    // 各市区町村別進捗バーのレンダリングをループでマッピング
    let progressBarsHtml = '';
    cities.forEach(cityItem => {
      if (window.TurnoutProgressBar) {
        progressBarsHtml += window.TurnoutProgressBar.render({
          city: cityItem.city,
          turnoutRate: cityItem.turnoutRate,
          status: cityItem.status
        });
      }
    });

    return `
      <section class="card premium-glass grid-col-2" data-motion="fade-up" data-delay="${delay}">
        <h2>Turnout Status</h2>
        
        <div class="turnout-summary">
          <div class="turnout-overall">
            <span class="turnout-overall-label">Overall District Turnout</span>
            <span class="turnout-overall-value" id="overall-turnout-val">${overall.toFixed(1)} %</span>
          </div>
        </div>

        <div class="turnout-list">
          ${progressBarsHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.TurnoutCard = TurnoutCard;
