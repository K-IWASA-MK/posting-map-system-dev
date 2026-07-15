/**
 * DashboardNavigationCard.js
 * 
 * 登録されたナビゲーション定義と現在のアクティブ状態、パス変換、および
 * パンくずリスト階層定義を一覧形式で読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardNavigationCard {
  /**
   * ナビゲーション管理カードをレンダリングする
   * @param {object} props { navigations, activeNavId, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const list = props.navigations || [];
    const activeNavId = props.activeNavId || '-';
    const delay = props.delay || 0;

    const rows = list.map(nav => {
      const activeClass = nav.navigationId === activeNavId ? 'nav-row-active' : '';
      return `
        <div class="nav-row ${activeClass}">
          <div class="nav-meta">
            <span class="nav-name font-mono ${nav.navigationId === activeNavId ? 'text-glow-blue' : ''}">${nav.navigationName || '-'}</span>
            <span class="nav-status-badge status-${(nav.status || '').toLowerCase()} font-mono">${nav.status || '-'}</span>
          </div>
          <div class="nav-details">
            <div class="nav-detail-item">
              <span class="nav-detail-label">Route</span>
              <span class="nav-detail-value font-mono">${nav.route || '-'}</span>
            </div>
            <div class="nav-detail-item">
              <span class="nav-detail-label">Workspace ID</span>
              <span class="nav-detail-value font-mono">${nav.workspaceId || '-'}</span>
            </div>
            <div class="nav-detail-item">
              <span class="nav-detail-label">View Mode</span>
              <span class="nav-detail-value font-mono highlight-viewmode">${nav.viewMode || '-'}</span>
            </div>
            <div class="nav-detail-item">
              <span class="nav-detail-label">Category</span>
              <span class="nav-detail-value">${nav.category || '-'}</span>
            </div>
            <div class="nav-detail-item">
              <span class="nav-detail-label">Default View</span>
              <span class="nav-detail-value font-mono highlight-default">${nav.defaultView ? 'YES' : 'NO'}</span>
            </div>
          </div>
          <div class="nav-breadcrumb-wrap">
            <span class="nav-detail-label">Breadcrumb Chain</span>
            <div class="nav-breadcrumb-chain font-mono">${nav.breadcrumb ? nav.breadcrumb.join(' ➔ ') : '-'}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <section class="dashboard-navigation-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Dashboard Navigation Routing Registry</h2>
          <span class="card-subtitle">Active Routes, ViewMode Mapping, and Breadcrumb Hierarchies</span>
        </div>
        <div class="navigation-list-container">
          ${rows || '<div class="no-data">No Navigation Routes Found</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.DashboardNavigationCard = DashboardNavigationCard;
