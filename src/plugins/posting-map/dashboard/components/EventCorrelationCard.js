/**
 * EventCorrelationCard.js
 * 
 * 抽出された相関関係チェーン群を縦方向のグラフ形式で表示する premium-glass カードコンポーネント。
 * 
 * 警告：本ファイル内への推論ロジック、異常分析、自動対応、および button 等の操作用要素の実装は厳禁である。
 */

class EventTimelineCardStub {
  // マーカーを引くため Timeline ストアが必要であることをコメント
}

class EventCorrelationCard {
  /**
   * 相関配列とタイムラインデータから相関グラフ HTML 文字列を出力する
   * @param {object} props 
   * @param {Array} props.correlations 相関データリスト
   * @param {number} props.delay 遅延時間
   * @returns {string} HTML文字列
   */
  static render(props) {
    const correlations = props.correlations || [];
    const delay = props.delay || 0;

    // TimelineStore からイベント実体を逆引き
    const allEvents = window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline() : [];

    let chainsHtml = '';

    correlations.forEach((corr, chainIdx) => {
      // 1. 各 ID からイベント実オブジェクトを引く
      const chainEvents = corr.eventIds
        .map(id => allEvents.find(e => e.eventId === id))
        .filter(Boolean)
        .sort((a, b) => a.rawTimestamp - b.rawTimestamp); // 時系列昇順 (上から下へ流れる)

      if (chainEvents.length < 2) return;

      let flowHtml = '';
      chainEvents.forEach((evt, idx) => {
        // ノード描画
        const nodeHtml = window.EventCorrelationNode.render(evt);

        // 接続ライン描画 (最後のノード以外)
        let lineHtml = '';
        if (idx < chainEvents.length - 1) {
          const nextEvt = chainEvents[idx + 1];
          // 接続線カラー判定 (最高重要度を適用)
          const highestSeverity = (evt.severity === 'CRITICAL' || nextEvt.severity === 'CRITICAL') ? 'CRITICAL' :
                                  (evt.severity === 'WARNING' || nextEvt.severity === 'WARNING') ? 'WARNING' : 'INFO';
          
          lineHtml = window.EventCorrelationLine.render(highestSeverity);
        }

        flowHtml += `
          ${nodeHtml}
          ${lineHtml}
        `;
      });

      const labelBadge = corr.relationType === 'TEMPORAL_SEQUENCE' ? 'TEMPORAL SEQUENCE' : 'CATEGORY GROUP';
      const isNew = (Date.now() - chainEvents[chainEvents.length - 1].rawTimestamp) < 2000;
      const newClass = isNew ? 'correlation-chain-new' : '';

      chainsHtml += `
        <div class="correlation-chain ${newClass}">
          <div class="correlation-chain-meta">
            <span class="correlation-relation-badge">${labelBadge}</span>
            <span class="correlation-time-span">${corr.timeRange}</span>
          </div>
          <div class="correlation-chain-flow">
            ${flowHtml}
          </div>
        </div>
      `;
    });

    return `
      <section class="card premium-glass grid-col-2" aria-label="Event Correlation Graph" data-motion="fade-up" data-delay="${delay}">
        <h2>Event Correlation Graph</h2>
        <div class="correlation-container">
          ${chainsHtml || '<p class="correlation-empty">No correlations mapped.</p>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.EventCorrelationCard = EventCorrelationCard;
