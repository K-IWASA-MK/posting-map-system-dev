/**
 * DashboardRenderer.js
 * 
 * コンポーネントマウント＆配置制御レンダラー。
 * データの取得や状態計算は行わず、Props データを各コンポーネントへ引き渡して DOM へ一元描画する。
 */

class DashboardRenderer {
  static hasAttached = false;

  /**
   * 正規化されたデータを受け取り、対応する各ビジュアルコンポーネントを DOM へ一元マウントする
   * @param {object} data 正規化されたデータ構造 (DashboardDataAdapter)
   */
  static render(data) {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer) {
      console.warn('[Dashboard Renderer] マウントターゲット (#dashboard-grid-container) が見つかりません。');
      return;
    }

    console.log('[Dashboard Renderer] コンポーネント群のレンダリングを開始します...');

    const components = [
      {
        key: 'StatusCard',
        render: () => window.StatusCard.render({ title: 'Kernel Status', delay: 150, statusMap: data.kernelStatus }),
        props: data.kernelStatus
      },
      {
        key: 'SimulationCard',
        render: () => window.SimulationCard.render({ lastRun: data.simulation.lastRun, passed: data.simulation.passed, failed: data.simulation.failed, delay: 200 }),
        props: data.simulation
      },
      {
        key: 'MetricCard',
        render: () => window.MetricCard.render({ qualityScore: data.quality.qualityScore, reviewCount: data.quality.reviewCount, improvementDelta: data.quality.improvementDelta, delay: 250 }),
        props: data.quality
      },
      {
        key: 'KnowledgeCard',
        render: () => window.KnowledgeCard.render({ knowledgeTotal: data.knowledge.knowledgeTotal, officialCount: data.knowledge.officialCount, candidateCount: data.knowledge.candidateCount || (data.knowledge.knowledgeTotal - data.knowledge.officialCount), healthScore: data.knowledge.healthScore, gapCount: data.knowledge.gapCount, delay: 300 }),
        props: data.knowledge
      },
      {
        key: 'GovernanceCard',
        render: () => window.GovernanceCard.render({ pendingApproval: data.governance.pendingApproval, approvedCount: data.governance.approvedCount, auditCount: data.governance.auditCount, delay: 350 }),
        props: data.governance
      },
      {
        key: 'BillingCard',
        render: () => window.BillingCard.render({ licenseStatus: data.billing.licenseStatus, subscriptionStatus: data.billing.subscriptionStatus, delay: 400 }),
        props: data.billing
      },
      {
        key: 'ActivityTrendCard',
        render: () => window.ActivityTrendCard.render({ trendData: data.trendData || [25, 38, 55, 48, 72, 88.5], delay: 450 }),
        props: data.trendData
      },
      {
        key: 'ActivityLogCard',
        render: () => window.ActivityLogCard.render({ logs: data.logs, delay: 500 }),
        props: data.logs
      },
      {
        key: 'TurnoutCard',
        render: () => window.TurnoutCard.render({ overall: data.turnout.overall, cities: data.turnout.cities, delay: 550 }),
        props: data.turnout
      }
    ];

    // 初回マウント時、またはコンポーネント数が一致しない場合は全件一括マウント
    if (gridContainer.children.length !== components.length) {
      console.log('[Dashboard Renderer] 初回一括マウントを実行します。');
      let html = '';
      components.forEach(c => {
        window.DashboardRenderCache.hasChanged(c.key, c.props);
        html += c.render();
      });
      gridContainer.innerHTML = html;
    } else {
      // 差分更新 (Changed Component Detection)
      console.log('[Dashboard Renderer] 差分更新チェックを実行します。');
      components.forEach((c, idx) => {
        if (window.DashboardRenderCache.hasChanged(c.key, c.props)) {
          console.log(`[Dashboard Renderer] コンポーネントの変更を検知: ${c.key}`);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = c.render();
          const targetCard = gridContainer.children[idx];
          
          if (targetCard) {
            targetCard.outerHTML = tempDiv.innerHTML;
          }
        }
      });
    }

    // 定期更新用の EventBus イベント購読をアタッチ
    this.attachEventListeners();
  }

  /**
   * リアルタイム更新のイベントバス購読をバインドする
   */
  static attachEventListeners() {
    if (this.hasAttached) return;
    this.hasAttached = true;

    // 新着ログ検知イベントの購読
    window.DashboardEventBus.on('new-activity-logs', (newLogs) => {
      const logListEl = document.querySelector('.log-list');
      if (!logListEl) return;

      console.log('[Dashboard Renderer] 新着ログを検知しました。差分を追加します:', newLogs);

      // 新しい順（インデックス順）に Prepend 挿入する
      newLogs.forEach(log => {
        const itemHtml = window.ActivityLogCard.renderItem(log, 0);
        logListEl.insertAdjacentHTML('afterbegin', itemHtml);
      });

      // 追加要素のフェード・Glow・スクロールアニメーションをトリガー
      if (window.DashboardMotion) {
        window.DashboardMotion.animateNewLogs();
      }
    });

    // 全体更新完了イベントの購読 (KPI更新時のUI表示や警告表示の同期)
    window.DashboardEventBus.on('dashboard-updated', (result) => {
      // ヘッダーステータスと更新時刻の動的リフレッシュ
      if (window.DashboardObserver) {
        window.DashboardObserver.updateHeaderStatus(result.statusState, result.errorMessage);
        const updateTimeEl = document.getElementById('update-time-text');
        if (updateTimeEl) {
          updateTimeEl.innerText = new Date().toLocaleTimeString();
        }
      }
    });
  }
}

// グローバル公開
window.DashboardRenderer = DashboardRenderer;
