/**
 * DashboardWorkspaceCard.js
 * 
 * 登録されたすべてのワークスペース（Executive, Operations, Analytics, History, etc.）および
 * その仕様構成、Widget・Layout のマッピング定義を読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardWorkspaceCard {
  /**
   * ワークスペース管理カードをレンダリングする
   * @param {object} props { workspaces, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const list = props.workspaces || [];
    const delay = props.delay || 0;

    const rows = list.map(w => `
      <div class="workspace-row">
        <div class="workspace-meta">
          <span class="workspace-name font-mono text-glow-blue">${w.spec.workspaceName || '-'}</span>
          <span class="workspace-status status-${(w.status || '').toLowerCase()} font-mono">${w.status || '-'}</span>
        </div>
        <p class="workspace-desc">${w.spec.description || ''}</p>
        <div class="workspace-details">
          <div class="workspace-detail-item">
            <span class="workspace-detail-label">Workspace ID</span>
            <span class="workspace-detail-value font-mono">${w.workspaceId || '-'}</span>
          </div>
          <div class="workspace-detail-item">
            <span class="workspace-detail-label">Category</span>
            <span class="workspace-detail-value">${w.spec.workspaceCategory || '-'}</span>
          </div>
          <div class="workspace-detail-item">
            <span class="workspace-detail-label">Layout ID</span>
            <span class="workspace-detail-value font-mono">${w.spec.layoutId || '-'}</span>
          </div>
          <div class="workspace-detail-item">
            <span class="workspace-detail-label">View Mode</span>
            <span class="workspace-detail-value font-mono highlight-viewmode">${w.spec.viewMode || '-'}</span>
          </div>
          <div class="workspace-detail-item">
            <span class="workspace-detail-label">Widget Count</span>
            <span class="workspace-detail-value font-mono highlight-number">${w.spec.widgetIds ? w.spec.widgetIds.length : 0}</span>
          </div>
        </div>
        <div class="workspace-widgets-wrap">
          <span class="workspace-detail-label">Assigned Widgets</span>
          <div class="workspace-widget-list font-mono">${w.spec.widgetIds ? w.spec.widgetIds.join(', ') : '-'}</div>
        </div>
      </div>
    `).join('');

    return `
      <section class="dashboard-workspace-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Dashboard Workspace Registry</h2>
          <span class="card-subtitle">Active Domain Workspaces & Structural Configuration Maps</span>
        </div>
        <div class="workspace-list-container">
          ${rows || '<div class="no-data">No Active Workspaces Found</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.DashboardWorkspaceCard = DashboardWorkspaceCard;
