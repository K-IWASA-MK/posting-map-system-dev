/**
 * DashboardWidgetCard.js
 * 
 * レジストリに登録されたウィジェットとその動作・ライフサイクル状態を
 * 読み取り専用で美しく表示する UI コンポーネント。
 * 
 * 警告：本ファイル内への API 通信、ボタン等の操作用要素、および AI 予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardWidgetCard {
  /**
   * ウィジェット管理カードをレンダリングする
   * @param {object} props { widgets, delay }
   * @returns {string} HTML Template String
   */
  static render(props) {
    const list = props.widgets || [];
    const delay = props.delay || 0;

    const rows = list.map(w => `
      <div class="widget-row">
        <div class="widget-meta">
          <span class="widget-name font-mono text-glow-blue">${w.spec.widgetTitle || '-'}</span>
          <span class="widget-status status-${(w.status || '').toLowerCase()} font-mono">${w.status || '-'}</span>
        </div>
        <div class="widget-details">
          <div class="widget-detail-item">
            <span class="widget-detail-label">Widget ID</span>
            <span class="widget-detail-value font-mono">${w.widgetId || '-'}</span>
          </div>
          <div class="widget-detail-item">
            <span class="widget-detail-label">Category</span>
            <span class="widget-detail-value">${w.spec.widgetCategory || '-'}</span>
          </div>
          <div class="widget-detail-item">
            <span class="widget-detail-label">Component</span>
            <span class="widget-detail-value font-mono">${w.componentName || '-'}</span>
          </div>
          <div class="widget-detail-item">
            <span class="widget-detail-label">Version</span>
            <span class="widget-detail-value font-mono">${w.spec.widgetVersion || '-'}</span>
          </div>
          <div class="widget-detail-item">
            <span class="widget-detail-label">Priority</span>
            <span class="widget-detail-value highlight-number font-mono">${w.spec.widgetPriority || 0}</span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <section class="dashboard-widget-card premium-glass" data-motion="fade-up" data-delay="${delay}">
        <div class="card-header-wrap">
          <h2 class="card-title">Dashboard Widget Registry</h2>
          <span class="card-subtitle">Active Registered Widgets & Runtime Lifecycles</span>
        </div>
        <div class="widget-list-container">
          ${rows || '<div class="no-data">No Active Widgets Registered</div>'}
        </div>
      </section>
    `;
  }
}

// グローバル公開
window.DashboardWidgetCard = DashboardWidgetCard;
