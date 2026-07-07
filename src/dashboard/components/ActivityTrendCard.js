/**
 * ActivityTrendCard.js
 * 
 * 活動推移グラフ用ビジュアルコンポーネント。
 * 通信や予測計算、外部サービスなどの依存を一切持たず、Props からバニラ SVG 描画を動的生成する。
 */

class ActivityTrendCard {
  /**
   * @param {object} props 
   * @param {Array<number>} props.trendData 時系列活動量データ配列 (例: [10, 24, 45, 30, 68, 88.5])
   * @param {number} props.delay トランジション遅延
   * @returns {string} HTML/SVG文字列
   */
  static render(props) {
    const data = props.trendData || [25, 38, 55, 48, 72, 88.5];
    const delay = props.delay || 0;
    const maxVal = Math.max(...data, 100);

    // SVG 座標系の定数定義
    const width = 500;
    const height = 200;
    const paddingX = 50;
    const paddingY = 35;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    // 座標マッピングの計算 (計算は座標変換のみとし、予測や統計処理は行わない)
    const points = data.map((val, i) => {
      const x = paddingX + i * (chartW / (data.length - 1));
      const y = height - (paddingY + (val / maxVal) * chartH);
      return { x, y, val };
    });

    // パス d 属性の組み立て
    let pathD = '';
    points.forEach((p, i) => {
      if (i === 0) {
        pathD = `M ${p.x} ${p.y}`;
      } else {
        pathD += ` L ${p.x} ${p.y}`;
      }
    });

    // データポイントおよびオレンジ発光（Glow）サークルの生成
    let pointsHtml = '';
    points.forEach((p, i) => {
      pointsHtml += `
        <circle cx="${p.x}" cy="${p.y}" r="4" class="trend-point" />
        <circle cx="${p.x}" cy="${p.y}" r="9" class="point-glow" />
      `;
    });

    return `
      <section class="card premium-glass grid-col-2" data-motion="fade-up" data-delay="${delay}">
        <h2>Activity Trend</h2>
        <div class="chart-container">
          <svg viewBox="0 0 500 200" class="trend-svg">
            <!-- グリッド線 -->
            <line x1="50" y1="35" x2="450" y2="35" class="grid-line" />
            <line x1="50" y1="100" x2="450" y2="100" class="grid-line" />
            <line x1="50" y1="165" x2="450" y2="165" class="grid-line" />
            
            <!-- 折れ線パス -->
            <path d="${pathD}" class="trend-line" />
            
            <!-- 発光ポイント -->
            ${pointsHtml}
          </svg>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.ActivityTrendCard = ActivityTrendCard;
