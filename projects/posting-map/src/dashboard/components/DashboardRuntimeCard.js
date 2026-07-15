/**
 * DashboardRuntimeCard.js
 * 
 * ダッシュボードランタイム全体の起動状態、初期化完了モジュールリスト、
 * および起動所要時間を一覧形式で読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardRuntimeCard {
  /**
   * ランタイム管理カードをレンダリングする
   * @param {object} props { runtimeData, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const data = props.runtimeData || {
      runtimeId: '-',
      runtimeVersion: '-',
      runtimeStatus: 'unknown',
      initializedModulesCount: 0,
      initializedModules: [],
      bootTimestamp: '-',
      bootDurationMs: 0
    };
    const delay = props.delay || 0;

    return `
      <section class="dashboard-runtime-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Dashboard Runtime Boot Ledger</h2>
          <span class="card-subtitle">Active Bootloader lifecycle states & Core Subsystems Initialized</span>
        </div>
        <div class="runtime-grid">
          <div class="runtime-item">
            <span class="runtime-label">Runtime Status</span>
            <span class="runtime-value font-mono status-running">${data.runtimeStatus}</span>
          </div>
          <div class="runtime-item">
            <span class="runtime-label">Runtime ID</span>
            <span class="runtime-value font-mono text-glow-blue">${data.runtimeId}</span>
          </div>
          <div class="runtime-item">
            <span class="runtime-label">Version</span>
            <span class="runtime-value font-mono">${data.runtimeVersion}</span>
          </div>
          <div class="runtime-item">
            <span class="runtime-label">Initialized Modules</span>
            <span class="runtime-value font-mono highlight-number">${data.initializedModulesCount}</span>
          </div>
          <div class="runtime-item col-span-2">
            <span class="runtime-label">Boot Timestamp</span>
            <span class="runtime-value font-mono">${data.bootTimestamp}</span>
          </div>
          <div class="runtime-item col-span-2">
            <span class="runtime-label">Boot Duration</span>
            <span class="runtime-value font-mono highlight-number">${data.bootDurationMs} ms</span>
          </div>
        </div>
        <div class="modules-list-wrap">
          <span class="runtime-label">Initialized Modules Boot Order</span>
          <div class="modules-boot-list font-mono">${data.initializedModules && data.initializedModules.length > 0 ? data.initializedModules.join(' ➔ ') : '-'}</div>
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.DashboardRuntimeCard = DashboardRuntimeCard;
