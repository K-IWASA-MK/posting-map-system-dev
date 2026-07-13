/**
 * HistorySnapshotCard.js
 * 
 * 特定の時間マーク（09:00, 12:00, 15:00等）における
 * カバー率および受信イベント数のスナップショット状態を
 * 美しく Read-Only 表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測ロジックの実装は厳禁である。
 */

class HistorySnapshotCard {
  /**
   * 履歴スナップショットカードをレンダリングする
   * @param {object} props { historySnapshots, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const snapshots = props.historySnapshots || [];
    const delay = props.delay || 0;

    const rows = snapshots.map(s => `
      <div class="snapshot-row-item">
        <span class="snapshot-id text-glow-blue font-mono">${s.snapshotId}</span>
        <span class="snapshot-time font-mono">${s.timestamp}</span>
        <span class="snapshot-count font-mono">${s.totalEvents} events</span>
        <span class="snapshot-coverage font-mono">${s.coverage}%</span>
      </div>
    `).join('');

    return `
      <section class="field-history-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Historical Progress Snapshots</h2>
          <span class="card-subtitle">Static State Archives Across Key Timeline Markers</span>
        </div>
        <div class="snapshot-list-container">
          ${rows || '<div class="no-data">No Snapshots Available</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.HistorySnapshotCard = HistorySnapshotCard;
