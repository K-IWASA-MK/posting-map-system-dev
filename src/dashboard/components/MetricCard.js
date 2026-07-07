/**
 * MetricCard.js
 * 
 * クオリティ・メトリクスカード描画コンポーネント。
 * KPICard 共通部品を継承・呼び出し、表示データ項目（Props）を整形する。
 */

class MetricCard {
  /**
   * @param {object} props 
   * @param {number} props.qualityScore 品質スコア値 (88.5等)
   * @param {number} props.reviewCount 監査実行回数 (142等)
   * @param {number} props.improvementDelta 改善デルタ値 (4.2等)
   * @param {number} props.delay トランジション遅延
   * @returns {string} HTML文字列
   */
  static render(props) {
    const kpiProps = {
      title: 'Quality Metrics',
      delay: props.delay || 0,
      items: [
        {
          label: 'Overall Score',
          value: props.qualityScore,
          unit: ' %',
          colorClass: 'accent-blue',
          id: 'quality-overall-score'
        },
        {
          label: 'Review Result',
          value: `Total Reviews: ${props.reviewCount}`,
          id: 'quality-review-result'
        },
        {
          label: 'Self Review Result',
          value: 'Self Review: Passed',
          id: 'quality-self-result'
        },
        {
          label: 'Improvement Delta',
          value: `Delta: +${props.improvementDelta}`,
          id: 'quality-delta'
        }
      ]
    };

    return window.KPICard.render(kpiProps);
  }
}

// グローバル公開
window.MetricCard = MetricCard;
