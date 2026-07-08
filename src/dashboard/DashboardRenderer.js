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
      },
      {
        key: 'EventTimelineCard',
        render: () => window.EventTimelineCard.render({ events: window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline() : [], delay: 600 }),
        props: window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline() : []
      },
      {
        key: 'EventCorrelationCard',
        render: () => window.EventCorrelationCard.render({ correlations: window.DashboardEventCorrelationStore ? window.DashboardEventCorrelationStore.getCorrelations() : [], delay: 650 }),
        props: window.DashboardEventCorrelationStore ? window.DashboardEventCorrelationStore.getCorrelations() : []
      },
      {
        key: 'EventGraphCard',
        render: () => window.EventGraphCard.render({ graphs: window.DashboardEventGraphStore ? window.DashboardEventGraphStore.getGraphs() : [], delay: 700 }),
        props: window.DashboardEventGraphStore ? window.DashboardEventGraphStore.getGraphs() : []
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

    // 統合リアルタイムイベントの購読 (Attention Queue 順に描画をソート＆Visual Routing)
    window.DashboardEventBus.on('realtime-event-received', (event) => {
      console.log('[Dashboard Renderer] インテリジェントリアルタイムイベント受信:', event);
      
      // 1. アテンションキューに基づくログの重要度順再ソート描画
      const logListEl = document.querySelector('.log-list');
      if (logListEl && window.DashboardAttentionQueue) {
        const queue = window.DashboardAttentionQueue.getQueue();
        let listHtml = '';
        queue.forEach((item, i) => {
          let severityClass = '';
          if (item.severity === 'CRITICAL') severityClass = 'log-critical';
          else if (item.severity === 'WARNING') severityClass = 'log-warning';

          // 受信から 2 秒未満の新着ログ項目のみ一時的に脈動
          const glowClass = (item.eventId === event.eventId && (Date.now() - item.rawTimestamp) < 2000) ? 'new-log-glow' : '';

          listHtml += `
            <li class="log-item ${glowClass} ${severityClass}">
              <span class="log-time">${item.timestamp}</span>
              <span class="log-module">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
              <span class="log-message">${item.message}</span>
            </li>
          `;
        });
        logListEl.innerHTML = listHtml;
      }

      // 2. 重要度別ビジュアルルーティング (Visual Routing)
      if (window.DashboardMotion && window.DashboardMotion.glowCard) {
        if (event.severity === 'CRITICAL') {
          // CRITICAL: StatusCard を Glow 発光させて警告
          const statusCard = document.querySelector('[aria-label="Kernel Status"]');
          if (statusCard) window.DashboardMotion.glowCard(statusCard);

          // StatusText も連動
          const statusTextEl = document.getElementById('status-text');
          if (statusTextEl) {
            statusTextEl.innerText = 'LIVE';
            statusTextEl.className = 'accent-green';
          }
        } else if (event.severity === 'WARNING') {
          // WARNING: ActivityLogCard を Glow 発光させて警告
          const logCard = document.querySelector('[aria-label="System Activity Log"]');
          if (logCard) window.DashboardMotion.glowCard(logCard);
        } else {
          // INFO (quality等): Quality Metricsカードを Glow
          if (event.category === 'quality') {
            const reviewCountEl = document.getElementById('quality-review-count');
            if (reviewCountEl) {
              let current = parseInt(reviewCountEl.innerText || '0', 10);
              reviewCountEl.innerText = current + 1;
            }
            const qualityCard = document.querySelector('[aria-label="Quality Metrics"]');
            if (qualityCard) window.DashboardMotion.glowCard(qualityCard);
          }
        }
      }
    });

    // リアルタイム接続ステータスバッジの同期
    window.DashboardEventBus.on('realtime-status-changed', (status) => {
      const el = document.getElementById('realtime-status-text');
      if (!el) return;

      el.className = '';
      if (status.state === 'LIVE') {
        el.innerText = '● LIVE STREAM';
        el.classList.add('realtime-live');
      } else if (status.state === 'CONNECTING') {
        el.innerText = '● CONNECTING';
        el.classList.add('realtime-warning');
      } else {
        el.innerText = '● OFFLINE';
        el.classList.add('realtime-offline');
      }
    });

    // タイムライン更新イベントの購読
    window.DashboardEventBus.on('event-timeline-update', (timelineEvents) => {
      console.log('[Dashboard Renderer] タイムライン更新イベント受信:', timelineEvents);
      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventTimelineCard) return;

      // EventTimelineCard は components 配列の 10 番目（インデックス9）
      const timelineCardEl = gridContainer.children[9];
      if (timelineCardEl) {
        const newHtml = window.EventTimelineCard.render({ events: timelineEvents, delay: 0 });
        window.DashboardRenderCache.hasChanged('EventTimelineCard', timelineEvents);
        timelineCardEl.outerHTML = newHtml;

        // アニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateTimeline) {
          window.DashboardMotion.animateTimeline();
        }
      }
    });

    // 相関グラフ更新イベントの購読
    window.DashboardEventBus.on('event-correlation-update', (correlations) => {
      console.log('[Dashboard Renderer] 相関グラフ更新イベント受信:', correlations);
      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventCorrelationCard) return;

      // EventCorrelationCard は components 配列の 11 番目（インデックス10）
      const correlationCardEl = gridContainer.children[10];
      if (correlationCardEl) {
        const newHtml = window.EventCorrelationCard.render({ correlations: correlations, delay: 0 });
        window.DashboardRenderCache.hasChanged('EventCorrelationCard', correlations);
        correlationCardEl.outerHTML = newHtml;

        // 相関アニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateCorrelation) {
          window.DashboardMotion.animateCorrelation();
        }
      }
    });

    // 関係グラフ更新イベントの購読
    window.DashboardEventBus.on('event-graph-update', (graphs) => {
      console.log('[Dashboard Renderer] 関係グラフ更新イベント受信:', graphs);
      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventGraphCard) return;

      // EventGraphCard は components 配列の 12 番目（インデックス11）
      const graphCardEl = gridContainer.children[11];
      if (graphCardEl) {
        const newHtml = window.EventGraphCard.render({ graphs: graphs, delay: 0 });
        window.DashboardRenderCache.hasChanged('EventGraphCard', graphs);
        graphCardEl.outerHTML = newHtml;

        // グラフアニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateGraph) {
          window.DashboardMotion.animateGraph();
        }
      }
    });
  }
}

// グローバル公開
window.DashboardRenderer = DashboardRenderer;
