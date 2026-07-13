/**
 * TurnoutProgressBar.js
 * 
 * 投票率進捗バーメーター描画用ビジュアルサブコンポーネント。
 * 勝敗や分析、閾値などのロジックを持たず、市区町村別の進捗 HTML メーターを出力する。
 */

class TurnoutProgressBar {
  /**
   * @param {object} props 
   * @param {string} props.city 市区町村名
   * @param {number} props.turnoutRate 投票率実績値
   * @param {string} props.status 稼働ステータス名
   * @returns {string} HTML文字列
   */
  static render(props) {
    const city = props.city || '';
    const turnoutRate = props.turnoutRate || 0;
    const status = props.status || 'Stable';

    // 進捗メーターの初期幅は 0% とし、目標値を data-target-width にセットしてモーション起動を待つ
    return `
      <div class="turnout-item">
        <div class="turnout-info">
          <span class="city-name">${city}</span>
          <span class="turnout-rate-badge">${status}</span>
          <span class="turnout-rate">${turnoutRate.toFixed(1)} %</span>
        </div>
        <div class="turnout-progress" role="progressbar" aria-valuenow="${turnoutRate.toFixed(1)}" aria-valuemin="0" aria-valuemax="100" aria-label="${city} turnout rate">
          <div class="turnout-fill" style="width: 0%;" data-target-width="${turnoutRate.toFixed(1)}%"></div>
        </div>
      </div>
    `;
  }
}

// グローバル公開
window.TurnoutProgressBar = TurnoutProgressBar;
