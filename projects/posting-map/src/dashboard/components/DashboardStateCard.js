/**
 * DashboardStateCard.js
 * 
 * ダッシュボードのアクティブ状態のスナップショット、バージョン情報、
 * および初期化ステータスを読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardStateCard {
  /**
   * 状態管理カードをレンダリングする
   * @param {object} props { stateData, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const data = props.stateData || {
      currentWorkspace: '-',
      currentView: '-',
      currentLayout: '-',
      widgetCount: 0,
      renderStatus: '-',
      initialized: false,
      stateVersion: 0,
      lastUpdated: '-'
    };
    const delay = props.delay || 0;

    return `
      <section class="dashboard-state-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Dashboard State Manager Ledger</h2>
          <span class="card-subtitle">Active Centralized State Tree Snapshot & Version Matrix</span>
        </div>
        <div class="state-grid">
          <div class="state-item">
            <span class="state-label">Current Workspace</span>
            <span class="state-value font-mono text-glow-blue">${data.currentWorkspace}</span>
          </div>
          <div class="state-item">
            <span class="state-label">Current View Mode</span>
            <span class="state-value font-mono">${data.currentView}</span>
          </div>
          <div class="state-item">
            <span class="state-label">Current Layout ID</span>
            <span class="state-value font-mono">${data.currentLayout}</span>
          </div>
          <div class="state-item">
            <span class="state-label">Widget Count</span>
            <span class="state-value font-mono highlight-number">${data.widgetCount}</span>
          </div>
          <div class="state-item">
            <span class="state-label">Render Status</span>
            <span class="state-value font-mono status-rendered">${data.renderStatus}</span>
          </div>
          <div class="state-item">
            <span class="state-label">Initialized</span>
            <span class="state-value font-mono">${data.initialized ? 'TRUE' : 'FALSE'}</span>
          </div>
          <div class="state-item">
            <span class="state-label">State Version</span>
            <span class="state-value font-mono highlight-number">v${data.stateVersion}</span>
          </div>
          <div class="state-item col-span-2">
            <span class="state-label">Last Updated</span>
            <span class="state-value font-mono">${data.lastUpdated}</span>
          </div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.DashboardStateCard = DashboardStateCard;
