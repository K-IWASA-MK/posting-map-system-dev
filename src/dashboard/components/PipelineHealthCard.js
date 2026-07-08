/**
 * PipelineHealthCard.js
 * 
 * AIOS パイプライン全体の処理進捗、遅延時間、およびバッファ格納状態を
 * 水平方向のインジケーターゲージとステータスバッジで可視化するエグゼクティブ向けカード。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class PipelineHealthCard {
  /**
   * パイプライン・ヘルスカードを描画する
   */
  static render(props) {
    const healthData = props.healthData || { pipelineNodes: [] };
    const delay = props.delay || 0;

    let itemsHtml = '';
    healthData.pipelineNodes.forEach((node, i) => {
      const statusClass = `health-status-${node.status.toLowerCase()}`;
      
      itemsHtml += `
        <div class="pipeline-health-row" data-motion="fade-up" data-delay="${delay + (i * 40)}">
          <div class="pipeline-health-meta">
            <span class="pipeline-health-layer">${node.layerName}</span>
            <span class="pipeline-health-processed">${node.processedCount.toLocaleString()} recs</span>
          </div>
          <div class="pipeline-health-progress-wrap">
            <div class="pipeline-health-progress-bg">
              <div class="pipeline-health-progress-fill ${statusClass}" style="width: ${node.bufferSize}%;"></div>
            </div>
            <span class="pipeline-health-latency">${node.latency.value}ms</span>
          </div>
          <div class="pipeline-health-status-wrap">
            <span class="health-status-badge ${statusClass}">${node.status}</span>
          </div>
        </div>
      `;
    });

    return `
      <section class="card premium-glass pipeline-health-card" aria-label="AIOS Pipeline State" data-motion="fade-up" data-delay="${delay}">
        <h2>Pipeline State</h2>
        <div class="pipeline-health-container">
          ${itemsHtml}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.PipelineHealthCard = PipelineHealthCard;
