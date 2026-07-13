/**
 * KnowledgeCard.js
 * 
 * ナレッジベースメトリクスカード描画コンポーネント。
 */

class KnowledgeCard {
  /**
   * @param {object} props 
   * @param {number} props.knowledgeTotal 総ナレッジ数 (1420等)
   * @param {number} props.officialCount 公式ナレッジ数 (1200等)
   * @param {number} props.candidateCount 候補ナレッジ数 (220等)
   * @param {number} props.healthScore 健全性スコア (94.6等)
   * @param {number} props.gapCount ナレッジギャップ数 (12等)
   * @param {number} props.delay 表示遅延
   * @returns {string} HTML文字列
   */
  static render(props) {
    const kpiProps = {
      title: 'Knowledge Metrics',
      delay: props.delay || 0,
      items: [
        {
          label: 'Total Knowledge',
          value: props.knowledgeTotal,
          id: 'knowledge-total'
        },
        {
          label: 'Official Count',
          value: props.officialCount,
          colorClass: 'accent-blue',
          id: 'knowledge-official'
        },
        {
          label: 'Candidate Count',
          value: props.candidateCount,
          id: 'knowledge-candidate'
        },
        {
          label: 'Health Score',
          value: `Score: ${props.healthScore} % (Gap: ${props.gapCount})`,
          colorClass: 'accent-green',
          id: 'knowledge-health'
        }
      ]
    };

    return window.KPICard.render(kpiProps);
  }
}

// グローバル公開
window.KnowledgeCard = KnowledgeCard;
