/**
 * DashboardRenderer.js
 * 
 * コンポーネントマウント＆配置制御レンダラー。
 * データの取得や状態計算は行わず、Props データを各コンポーネントへ引き渡して DOM へ一元描画する。
 */

class DashboardRenderer {
  static hasAttached = false;

  /**
   * 差し替えられた要素、およびその配下の data-motion 要素をすべて活性化する
   */
  static activateMotion(el) {
    if (!el) return;
    el.classList.add('motion-active');
    el.querySelectorAll('[data-motion]').forEach(item => {
      item.classList.add('motion-active');
    });
  }

  /**
   * 正規化されたデータを受け取り、対応する各ビジュアルコンポーネントを DOM へ一元マウントする
   * @param {object} data 正規化されたデータ構造 (DashboardDataAdapter)
   */
  static getViewMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewQuery = urlParams.get('view');
    
    // 1. クエリパラメータ指定を最優先
    if (viewQuery) {
      if (viewQuery === 'raw' || viewQuery === 'executive' || viewQuery === 'mobile' || viewQuery === 'trust' || viewQuery === 'tenant' || viewQuery === 'global' || viewQuery === 'intelligence' || viewQuery === 'operations' || viewQuery === 'analytics' || viewQuery === 'history' || viewQuery === 'evidence' || viewQuery === 'audit' || viewQuery === 'trace') {
        return viewQuery;
      }
    }
    
    // 2. クエリなしの場合のみ viewport 判定
    if (window.innerWidth < 768) {
      return 'mobile';
    }
    
    // 3. デフォルトは PC版 Executive
    return 'executive';
  }

  static render(data) {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer) {
      console.warn('[Dashboard Renderer] マウントターゲット (#dashboard-grid-container) が見つかりません。');
      return;
    }

    // 1. テナント情報のインジェクション (PC用)
    const tenantEl = document.getElementById('header-tenant-context');
    if (tenantEl && window.DashboardTenantContext) {
      const context = window.DashboardTenantContext.getContext();
      tenantEl.innerHTML = `
        <span class="tenant-name">${context.tenantName}</span>
        <span class="tenant-id">${context.tenantId}</span>
      `;
      tenantEl.style.display = 'flex';
    }

    console.log('[Dashboard Renderer] コンポーネント群のレンダリングを開始します...');

    const viewMode = DashboardRenderer.getViewMode();

    // 起動シーケンス・ランタイムの駆動
    if (window.DashboardRuntimeManager) {
      window.DashboardRuntimeManager.boot();
    }

    // 描画パイプラインの実行
    if (window.DashboardRenderingPipeline) {
      window.DashboardRenderingPipeline.run(viewMode, window.innerWidth);
    }
    
    // 2. サイドバーメニューの active 状態を同期
    document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
    let activeMenuId = 'menu-raw'; // デフォルトフォールバック
    if (window.DashboardNavigationRegistry) {
      const activeNav = window.DashboardNavigationRegistry.getNavigationByViewMode(viewMode);
      if (activeNav) {
        activeMenuId = activeNav.navigationId.replace('nav-', 'menu-');
      }
    } else {
      if (viewMode === 'executive') activeMenuId = 'menu-executive';
      else if (viewMode === 'trust') activeMenuId = 'menu-trust';
      else if (viewMode === 'tenant') activeMenuId = 'menu-tenant';
      else if (viewMode === 'global') activeMenuId = 'menu-global';
      else if (viewMode === 'intelligence') activeMenuId = 'menu-intelligence';
      else if (viewMode === 'operations') activeMenuId = 'menu-operations';
      else if (viewMode === 'analytics') activeMenuId = 'menu-analytics';
      else if (viewMode === 'history') activeMenuId = 'menu-history';
      else if (viewMode === 'evidence') activeMenuId = 'menu-evidence';
      else if (viewMode === 'audit') activeMenuId = 'menu-audit';
      else if (viewMode === 'trace') activeMenuId = 'menu-trace';
    }
    const activeMenuEl = document.getElementById(activeMenuId);
    if (activeMenuEl) {
      activeMenuEl.classList.add('active');
    }

    let components = [];

    // グリッドコンテナのレイアウトクラス調整
    gridContainer.className = 'dashboard-grid';
    if (viewMode === 'mobile') {
      gridContainer.classList.add('dashboard-grid-mobile');
    }

    if (viewMode === 'mobile') {
      const mobData = window.MobileExecutiveAdapter ? window.MobileExecutiveAdapter.getMobileData() : { kpis: {}, flowGraph: {}, activityStream: [], evolutionStatus: {} };
      const healthData = window.PipelineHealthAdapter ? window.PipelineHealthAdapter.getHealthData() : { pipelineNodes: [] };

      components = [
        {
          key: 'MobileHeaderCard',
          render: () => window.MobileHeaderCard.render({ statusState: 'ONLINE', timestamp: new Date().toLocaleTimeString(), delay: 100 }),
          props: mobData.kpis
        },
        {
          key: 'HierarchyContextCard',
          render: () => window.HierarchyContextCard.render({ hierarchyContext: mobData.hierarchyContext, delay: 120 }),
          props: mobData.hierarchyContext
        },
        {
          key: 'MobileKPICard',
          render: () => window.MobileKPICard.render({ kpis: mobData.kpis, delay: 150 }),
          props: mobData.kpis
        },
        {
          key: 'MobileFlowCard',
          render: () => window.MobileFlowCard.render({ flowGraph: mobData.flowGraph, healthData, delay: 200 }),
          props: { flowGraph: mobData.flowGraph, healthData }
        },
        {
          key: 'MobileActivityCard',
          render: () => window.MobileActivityCard.render({ activityStream: mobData.activityStream, delay: 250 }),
          props: mobData.activityStream
        },
        {
          key: 'MobileEvolutionCard',
          render: () => window.MobileEvolutionCard.render({ evolutionStatus: mobData.evolutionStatus, delay: 300 }),
          props: mobData.evolutionStatus
        },
        {
          key: 'MobileMemoryCard',
          render: () => window.MobileMemoryCard.render({ kpis: mobData.kpis, delay: 350 }),
          props: mobData.kpis
        }
      ];
    } else if (viewMode === 'executive') {
      const execData = window.ExecutiveAdapter ? window.ExecutiveAdapter.getExecutiveData() : { kpis: {}, flowGraph: {}, activityStream: [], distribution: {}, evolutionStatus: {} };
      const healthData = window.PipelineHealthAdapter ? window.PipelineHealthAdapter.getHealthData() : { pipelineNodes: [] };

      components = [
        {
          key: 'HierarchyContextCard',
          render: () => window.HierarchyContextCard.render({ hierarchyContext: execData.hierarchyContext, delay: 100 }),
          props: execData.hierarchyContext
        },
        {
          key: 'ExecutiveKPICard',
          render: () => window.ExecutiveKPICard.render({ kpis: execData.kpis, delay: 150 }),
          props: execData.kpis
        },
        {
          key: 'IntelligenceFlowGraphCard',
          render: () => window.IntelligenceFlowGraphCard.render({ flowGraph: execData.flowGraph, healthData, delay: 200 }),
          props: { flowGraph: execData.flowGraph, healthData }
        },
        {
          key: 'PipelineHealthCard',
          render: () => window.PipelineHealthCard.render({ healthData, delay: 250 }),
          props: healthData
        },
        {
          key: 'RealtimeActivityStreamCard',
          render: () => window.RealtimeActivityStreamCard.render({ activityStream: execData.activityStream, delay: 300 }),
          props: execData.activityStream
        },
        {
          key: 'IntelligenceDistributionCard',
          render: () => window.IntelligenceDistributionCard.render({ distribution: execData.distribution, delay: 350 }),
          props: execData.distribution
        },
        {
          key: 'ExecutiveEvolutionStatusCard',
          render: () => window.ExecutiveEvolutionStatusCard.render({ evolutionStatus: execData.evolutionStatus, delay: 400 }),
          props: execData.evolutionStatus
        },
        {
          key: 'ExecutivePatternMemorySummaryCard',
          render: () => window.ExecutivePatternMemorySummaryCard.render({ kpis: execData.kpis, delay: 450 }),
          props: execData.kpis
        },
        {
          key: 'FieldOpsStatusCard',
          render: () => window.FieldOpsStatusCard.render({ fieldOpsStatus: execData.fieldOpsStatus, delay: 500 }),
          props: execData.fieldOpsStatus
        },
        {
          key: 'DashboardWidgetCard',
          render: () => window.DashboardWidgetCard.render({ widgets: window.DashboardWidgetAdapter ? window.DashboardWidgetAdapter.getDashboardWidgetData().widgets : [], delay: 550 }),
          props: window.DashboardWidgetAdapter ? window.DashboardWidgetAdapter.getDashboardWidgetData().widgets : []
        },
        {
          key: 'DashboardLayoutCard',
          render: () => window.DashboardLayoutCard.render({ activeLayout: window.DashboardLayoutAdapter ? window.DashboardLayoutAdapter.getDashboardLayoutData().activeLayout : { widgets: [] }, delay: 600 }),
          props: window.DashboardLayoutAdapter ? window.DashboardLayoutAdapter.getDashboardLayoutData().activeLayout : { widgets: [] }
        },
        {
          key: 'DashboardWorkspaceCard',
          render: () => window.DashboardWorkspaceCard.render({ workspaces: window.DashboardWorkspaceAdapter ? window.DashboardWorkspaceAdapter.getDashboardWorkspaceData().workspaces : [], delay: 650 }),
          props: window.DashboardWorkspaceAdapter ? window.DashboardWorkspaceAdapter.getDashboardWorkspaceData().workspaces : []
        },
        {
          key: 'DashboardStateCard',
          render: () => window.DashboardStateCard.render({ stateData: window.DashboardStateAdapter ? window.DashboardStateAdapter.getDashboardStateData() : {}, delay: 700 }),
          props: window.DashboardStateAdapter ? window.DashboardStateAdapter.getDashboardStateData() : {}
        },
        {
          key: 'DashboardNavigationCard',
          render: () => window.DashboardNavigationCard.render({
            navigations: window.DashboardNavigationAdapter ? window.DashboardNavigationAdapter.getDashboardNavigationData().navigations : [],
            activeNavId: window.DashboardNavigationAdapter ? window.DashboardNavigationAdapter.getDashboardNavigationData().activeNavId : '-',
            delay: 750
          }),
          props: window.DashboardNavigationAdapter ? window.DashboardNavigationAdapter.getDashboardNavigationData() : {}
        },
        {
          key: 'DashboardRenderingCard',
          render: () => window.DashboardRenderingCard.render({ renderData: window.DashboardRenderAdapter ? window.DashboardRenderAdapter.getDashboardRenderData() : {}, delay: 800 }),
          props: window.DashboardRenderAdapter ? window.DashboardRenderAdapter.getDashboardRenderData() : {}
        },
        {
          key: 'DashboardRuntimeCard',
          render: () => window.DashboardRuntimeCard.render({ runtimeData: window.DashboardRuntimeAdapter ? window.DashboardRuntimeAdapter.getDashboardRuntimeData() : {}, delay: 850 }),
          props: window.DashboardRuntimeAdapter ? window.DashboardRuntimeAdapter.getDashboardRuntimeData() : {}
        }
      ];
    } else if (viewMode === 'trust') {
      const trustData = window.TrustGovernanceAdapter ? window.TrustGovernanceAdapter.getGovernanceData() : { complianceScore: 100, status: 'PASS', records: [] };
      components = [
        {
          key: 'TrustGovernanceCard',
          render: () => window.TrustGovernanceCard.render({ data: trustData, delay: 150 }),
          props: trustData
        }
      ];
    } else if (viewMode === 'tenant') {
      const tenantData = window.MultiTenantAdapter ? window.MultiTenantAdapter.getMultiTenantData() : { tenants: [] };
      components = [
        {
          key: 'MultiTenantSeparationCard',
          render: () => window.MultiTenantSeparationCard.render({ tenants: tenantData.tenants, delay: 150 }),
          props: tenantData.tenants
        }
      ];
    } else if (viewMode === 'global') {
      const summaryData = window.MultiTenantExecutiveAdapter ? window.MultiTenantExecutiveAdapter.getMultiTenantExecutiveData() : { totalTenants: 0, totalRegions: 0, totalAreas: 0, totalEvents: 0, trustScore: 100 };
      components = [
        {
          key: 'MultiTenantExecutiveCard',
          render: () => window.MultiTenantExecutiveCard.render({ summary: summaryData, delay: 150 }),
          props: summaryData
        }
      ];
    } else if (viewMode === 'intelligence') {
      const intelData = window.TenantIntelligenceAdapter ? window.TenantIntelligenceAdapter.getTenantIntelligenceData() : { tenantSummary: {}, regionSummary: [], areaSummary: [], fieldEventSummary: {} };
      components = [
        {
          key: 'TenantDrilldownCard',
          render: () => window.TenantDrilldownCard.render({ summary: intelData.tenantSummary, delay: 150 }),
          props: intelData.tenantSummary
        },
        {
          key: 'AreaIntelligenceCard',
          render: () => window.AreaIntelligenceCard.render({ areas: intelData.areaSummary, fieldEventSummary: intelData.fieldEventSummary, delay: 200 }),
          props: { areas: intelData.areaSummary, fieldEventSummary: intelData.fieldEventSummary }
        }
      ];
    } else if (viewMode === 'operations') {
      const opsData = window.FieldOperationsAdapter ? window.FieldOperationsAdapter.getFieldOperationsData() : { tenantContext: {}, regionSummary: [], areaOperations: [] };
      components = [
        {
          key: 'FieldOperationsCard',
          render: () => window.FieldOperationsCard.render({ tenantContext: opsData.tenantContext, delay: 150 }),
          props: opsData.tenantContext
        },
        {
          key: 'AreaOperationsStatusCard',
          render: () => window.AreaOperationsStatusCard.render({ areaOperations: opsData.areaOperations, delay: 200 }),
          props: opsData.areaOperations
        }
      ];
    } else if (viewMode === 'analytics') {
      const analyticsData = window.FieldAnalyticsAdapter ? window.FieldAnalyticsAdapter.getFieldAnalyticsData() : { tenantId: "", averageCoverage: 0, trendData: {}, areaComparison: [], coverageHistory: [] };
      components = [
        {
          key: 'FieldAnalyticsTrendCard',
          render: () => window.FieldAnalyticsTrendCard.render({ trendData: analyticsData.trendData, averageCoverage: analyticsData.averageCoverage, delay: 150 }),
          props: { trendData: analyticsData.trendData, averageCoverage: analyticsData.averageCoverage }
        },
        {
          key: 'FieldAnalyticsComparisonCard',
          render: () => window.FieldAnalyticsComparisonCard.render({ areaComparison: analyticsData.areaComparison, coverageHistory: analyticsData.coverageHistory, delay: 200 }),
          props: { areaComparison: analyticsData.areaComparison, coverageHistory: analyticsData.coverageHistory }
        }
      ];
    } else if (viewMode === 'history') {
      const historyData = window.FieldHistoryAdapter ? window.FieldHistoryAdapter.getFieldHistoryData() : { tenantId: "", historyTimeline: [], historySnapshots: [] };
      components = [
        {
          key: 'FieldHistoryTimelineCard',
          render: () => window.FieldHistoryTimelineCard.render({ historyTimeline: historyData.historyTimeline, delay: 150 }),
          props: historyData.historyTimeline
        },
        {
          key: 'HistorySnapshotCard',
          render: () => window.HistorySnapshotCard.render({ historySnapshots: historyData.historySnapshots, delay: 200 }),
          props: historyData.historySnapshots
        }
      ];
    } else if (viewMode === 'evidence') {
      const evidenceData = window.FieldEvidenceAdapter ? window.FieldEvidenceAdapter.getFieldEvidenceData() : { tenantId: "", evidenceList: [] };
      components = [
        {
          key: 'FieldEvidenceCard',
          render: () => window.FieldEvidenceCard.render({ evidenceList: evidenceData.evidenceList, delay: 150 }),
          props: evidenceData.evidenceList
        }
      ];
    } else if (viewMode === 'audit') {
      const auditData = window.FieldAuditAdapter ? window.FieldAuditAdapter.getFieldAuditData() : { tenantId: "", auditList: [] };
      components = [
        {
          key: 'FieldAuditCard',
          render: () => window.FieldAuditCard.render({ auditList: auditData.auditList, delay: 150 }),
          props: auditData.auditList
        }
      ];
    } else if (viewMode === 'trace') {
      const traceData = window.FieldTraceAdapter ? window.FieldTraceAdapter.getFieldTraceData() : { tenantId: "", traceList: [] };
      components = [
        {
          key: 'FieldTraceCard',
          render: () => window.FieldTraceCard.render({ traceList: traceData.traceList, delay: 150 }),
          props: traceData.traceList
        }
      ];
    } else {
      components = [
        {
          key: 'ActivityLogCard',
          render: () => window.ActivityLogCard.render({ logs: data.logs, delay: 150 }),
          props: data.logs
        },
        {
          key: 'EventTimelineCard',
          render: () => window.EventTimelineCard.render({ events: window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline() : [], delay: 200 }),
          props: window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline() : []
        },
        {
          key: 'EventCorrelationCard',
          render: () => window.EventCorrelationCard.render({ correlations: window.DashboardEventCorrelationStore ? window.DashboardEventCorrelationStore.getCorrelations() : [], delay: 250 }),
          props: window.DashboardEventCorrelationStore ? window.DashboardEventCorrelationStore.getCorrelations() : []
        },
        {
          key: 'EventGraphCard',
          render: () => window.EventGraphCard.render({ graphs: window.DashboardEventGraphStore ? window.DashboardEventGraphStore.getGraphs() : [], delay: 300 }),
          props: window.DashboardEventGraphStore ? window.DashboardEventGraphStore.getGraphs() : []
        },
        {
          key: 'EventKnowledgeCard',
          render: () => window.EventKnowledgeCard.render({ knowledges: window.DashboardEventKnowledgeStore ? window.DashboardEventKnowledgeStore.getKnowledges() : [], delay: 350 }),
          props: window.DashboardEventKnowledgeStore ? window.DashboardEventKnowledgeStore.getKnowledges() : []
        },
        {
          key: 'EventInsightCard',
          render: () => window.EventInsightCard.render({ insights: window.DashboardEventInsightStore ? window.DashboardEventInsightStore.getInsights() : [], delay: 400 }),
          props: window.DashboardEventInsightStore ? window.DashboardEventInsightStore.getInsights() : []
        },
        {
          key: 'EventEvolutionCard',
          render: () => window.EventEvolutionCard.render({ evolutions: window.DashboardEventEvolutionStore ? window.DashboardEventEvolutionStore.getEvolutions() : [], delay: 450 }),
          props: window.DashboardEventEvolutionStore ? window.DashboardEventEvolutionStore.getEvolutions() : []
        },
        {
          key: 'EventPatternCard',
          render: () => window.EventPatternCard.render({ patterns: window.DashboardEventPatternStore ? window.DashboardEventPatternStore.getPatterns() : [], delay: 500 }),
          props: window.DashboardEventPatternStore ? window.DashboardEventPatternStore.getPatterns() : []
        },
        {
          key: 'EventMemoryCard',
          render: () => window.EventMemoryCard.render({ memories: window.DashboardEventMemoryStore ? window.DashboardEventMemoryStore.getMemories() : [], delay: 550 }),
          props: window.DashboardEventMemoryStore ? window.DashboardEventMemoryStore.getMemories() : []
        }
      ];
    }

    // 初回マウント時、コンポーネント数が一致しない場合、または表示モードが変更された場合は全件一括マウント
    const lastViewMode = gridContainer.getAttribute('data-last-view');
    if (gridContainer.children.length !== components.length || lastViewMode !== viewMode) {
      console.log(`[Dashboard Renderer] モード移行または初回読み込みのため、一括マウントを実行します。 Mode: ${viewMode}`);
      gridContainer.setAttribute('data-last-view', viewMode);
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
            const newCard = gridContainer.children[idx];
            if (newCard) {
              DashboardRenderer.activateMotion(newCard);
            }
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
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventTimelineCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventTimelineCard', timelineEvents)) return;
      console.log('[Dashboard Renderer] タイムライン更新イベント受信:', timelineEvents);

      // EventTimelineCard は components 配列の 2 番目（インデックス1）
      const timelineCardEl = gridContainer.children[1];
      if (timelineCardEl) {
        const newHtml = window.EventTimelineCard.render({ events: timelineEvents, delay: 0 });
        timelineCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[1];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // アニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateTimeline) {
          window.DashboardMotion.animateTimeline();
        }
      }
    });

    // 相関グラフ更新イベントの購読
    window.DashboardEventBus.on('event-correlation-update', (correlations) => {
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventCorrelationCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventCorrelationCard', correlations)) return;
      console.log('[Dashboard Renderer] 相関グラフ更新イベント受信:', correlations);

      // EventCorrelationCard は components 配列の 3 番目（インデックス2）
      const correlationCardEl = gridContainer.children[2];
      if (correlationCardEl) {
        const newHtml = window.EventCorrelationCard.render({ correlations: correlations, delay: 0 });
        correlationCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[2];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // 相関アニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateCorrelation) {
          window.DashboardMotion.animateCorrelation();
        }
      }
    });

    // 関係グラフ更新イベントの購読
    window.DashboardEventBus.on('event-graph-update', (graphs) => {
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventGraphCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventGraphCard', graphs)) return;
      console.log('[Dashboard Renderer] 関係グラフ更新イベント受信:', graphs);

      // EventGraphCard は components 配列の 4 番目（インデックス3）
      const graphCardEl = gridContainer.children[3];
      if (graphCardEl) {
        const newHtml = window.EventGraphCard.render({ graphs: graphs, delay: 0 });
        graphCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[3];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // グラフアニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateGraph) {
          window.DashboardMotion.animateGraph();
        }
      }
    });

    // 知識層更新イベントの購読
    window.DashboardEventBus.on('event-knowledge-update', (knowledges) => {
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventKnowledgeCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventKnowledgeCard', knowledges)) return;
      console.log('[Dashboard Renderer] 知識層更新イベント受信:', knowledges);

      // EventKnowledgeCard は components 配列の 5 番目（インデックス4）
      const knowledgeCardEl = gridContainer.children[4];
      if (knowledgeCardEl) {
        const newHtml = window.EventKnowledgeCard.render({ knowledges: knowledges, delay: 0 });
        knowledgeCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[4];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // 知識アニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateKnowledge) {
          window.DashboardMotion.animateKnowledge();
        }
      }
    });

    // インサイト層更新イベントの購読
    window.DashboardEventBus.on('event-insight-update', (insights) => {
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventInsightCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventInsightCard', insights)) return;
      console.log('[Dashboard Renderer] インサイト層更新イベント受信:', insights);

      // EventInsightCard は components 配列の 6 番目（インデックス5）
      const insightCardEl = gridContainer.children[5];
      if (insightCardEl) {
        const newHtml = window.EventInsightCard.render({ insights: insights, delay: 0 });
        insightCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[5];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // インサイトアニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateInsight) {
          window.DashboardMotion.animateInsight();
        }
      }
    });

    // エボリューション層更新イベントの購読
    window.DashboardEventBus.on('event-evolution-update', (evolutions) => {
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventEvolutionCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventEvolutionCard', evolutions)) return;
      console.log('[Dashboard Renderer] エボリューション層更新イベント受信:', evolutions);

      // EventEvolutionCard は components 配列の 7 番目（インデックス6）
      const evolutionCardEl = gridContainer.children[6];
      if (evolutionCardEl) {
        const newHtml = window.EventEvolutionCard.render({ evolutions: evolutions, delay: 0 });
        evolutionCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[6];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // エボリューションアニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateEvolution) {
          window.DashboardMotion.animateEvolution();
        }
      }
    });

    // パターン層更新イベントの購読
    window.DashboardEventBus.on('event-pattern-update', (patterns) => {
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventPatternCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventPatternCard', patterns)) return;
      console.log('[Dashboard Renderer] パターン層更新イベント受信:', patterns);

      // EventPatternCard は components 配列の 8 番目（インデックス7）
      const patternCardEl = gridContainer.children[7];
      if (patternCardEl) {
        const newHtml = window.EventPatternCard.render({ patterns: patterns, delay: 0 });
        patternCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[7];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // パターンアニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animatePattern) {
          window.DashboardMotion.animatePattern();
        }
      }
    });

    // メモリ層更新イベントの購読
    window.DashboardEventBus.on('event-memory-update', (memories) => {
      const viewMode = DashboardRenderer.getViewMode();
      if (viewMode === 'mobile') {
        DashboardRenderer.updateMobileDashboard();
        return;
      }
      if (viewMode === 'executive') {
        DashboardRenderer.updateExecutiveDashboard();
        return;
      }
      if (viewMode === 'tenant') {
        DashboardRenderer.updateTenantDashboard();
        return;
      }
      if (viewMode === 'global') {
        DashboardRenderer.updateGlobalDashboard();
        return;
      }
      if (viewMode === 'intelligence') {
        DashboardRenderer.updateIntelligenceDashboard();
        return;
      }
      if (viewMode === 'operations') {
        DashboardRenderer.updateOperationsDashboard();
        return;
      }
      if (viewMode === 'analytics') {
        DashboardRenderer.updateAnalyticsDashboard();
        return;
      }
      if (viewMode === 'history') {
        DashboardRenderer.updateHistoryDashboard();
        return;
      }
      if (viewMode === 'evidence') {
        DashboardRenderer.updateEvidenceDashboard();
        return;
      }
      if (viewMode === 'audit') {
        DashboardRenderer.updateAuditDashboard();
        return;
      }
      if (viewMode === 'trace') {
        DashboardRenderer.updateTraceDashboard();
        return;
      }

      const gridContainer = document.getElementById('dashboard-grid-container');
      if (!gridContainer || !window.EventMemoryCard) return;
      if (!window.DashboardRenderCache.hasChanged('EventMemoryCard', memories)) return;
      console.log('[Dashboard Renderer] メモリ層更新イベント受信:', memories);

      // EventMemoryCard は components 配列 of 9 番目（インデックス8）
      const memoryCardEl = gridContainer.children[8];
      if (memoryCardEl) {
        const newHtml = window.EventMemoryCard.render({ memories: memories, delay: 0 });
        memoryCardEl.outerHTML = newHtml;
        const newCard = gridContainer.children[8];
        if (newCard) {
          newCard.classList.add('motion-active');
        }

        // メモリアニメーション適用
        if (window.DashboardMotion && window.DashboardMotion.animateMemory) {
          window.DashboardMotion.animateMemory();
        }
      }
    });
  }

  /**
   * Executiveビューモード用の全画面差分更新を実行する
   */
  static updateExecutiveDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.ExecutiveAdapter) return;

    // 描画パイプラインの実行
    if (window.DashboardRenderingPipeline) {
      window.DashboardRenderingPipeline.run('executive', window.innerWidth);
    }

    const execData = window.ExecutiveAdapter.getExecutiveData();
    const healthData = window.PipelineHealthAdapter ? window.PipelineHealthAdapter.getHealthData() : { pipelineNodes: [] };

    // 0: HierarchyContextCard
    if (window.HierarchyContextCard && window.DashboardRenderCache.hasChanged('HierarchyContextCard', execData.hierarchyContext)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.HierarchyContextCard.render({ hierarchyContext: execData.hierarchyContext, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 1: ExecutiveKPICard
    if (window.ExecutiveKPICard && window.DashboardRenderCache.hasChanged('ExecutiveKPICard', execData.kpis)) {
      const el = gridContainer.children[1];
      if (el) {
        el.outerHTML = window.ExecutiveKPICard.render({ kpis: execData.kpis, delay: 0 });
        const newEl = gridContainer.children[1];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 2: IntelligenceFlowGraphCard (Composite props check)
    const flowProps = { flowGraph: execData.flowGraph, healthData };
    if (window.IntelligenceFlowGraphCard && window.DashboardRenderCache.hasChanged('IntelligenceFlowGraphCard', flowProps)) {
      const el = gridContainer.children[2];
      if (el) {
        el.outerHTML = window.IntelligenceFlowGraphCard.render({ flowGraph: execData.flowGraph, healthData, delay: 0 });
        const newEl = gridContainer.children[2];
        if (newEl) DashboardRenderer.activateMotion(newEl);
        if (window.DashboardMotion && window.DashboardMotion.animateFlowGraph) {
          window.DashboardMotion.animateFlowGraph();
        }
      }
    }
    // 3: PipelineHealthCard
    if (window.PipelineHealthCard && window.DashboardRenderCache.hasChanged('PipelineHealthCard', healthData)) {
      const el = gridContainer.children[3];
      if (el) {
        el.outerHTML = window.PipelineHealthCard.render({ healthData, delay: 0 });
        const newEl = gridContainer.children[3];
        if (newEl) DashboardRenderer.activateMotion(newEl);
        if (window.DashboardMotion && window.DashboardMotion.init) {
          // アニメーション再アタッチ
          window.DashboardMotion.init();
        }
      }
    }
    // 4: RealtimeActivityStreamCard
    if (window.RealtimeActivityStreamCard && window.DashboardRenderCache.hasChanged('RealtimeActivityStreamCard', execData.activityStream)) {
      const el = gridContainer.children[4];
      if (el) {
        el.outerHTML = window.RealtimeActivityStreamCard.render({ activityStream: execData.activityStream, delay: 0 });
        const newEl = gridContainer.children[4];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 5: IntelligenceDistributionCard
    if (window.IntelligenceDistributionCard && window.DashboardRenderCache.hasChanged('IntelligenceDistributionCard', execData.distribution)) {
      const el = gridContainer.children[5];
      if (el) {
        el.outerHTML = window.IntelligenceDistributionCard.render({ distribution: execData.distribution, delay: 0 });
        const newEl = gridContainer.children[5];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 6: ExecutiveEvolutionStatusCard
    if (window.ExecutiveEvolutionStatusCard && window.DashboardRenderCache.hasChanged('ExecutiveEvolutionStatusCard', execData.evolutionStatus)) {
      const el = gridContainer.children[6];
      if (el) {
        el.outerHTML = window.ExecutiveEvolutionStatusCard.render({ evolutionStatus: execData.evolutionStatus, delay: 0 });
        const newEl = gridContainer.children[6];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 7: ExecutivePatternMemorySummaryCard
    if (window.ExecutivePatternMemorySummaryCard && window.DashboardRenderCache.hasChanged('ExecutivePatternMemorySummaryCard', execData.kpis)) {
      const el = gridContainer.children[7];
      if (el) {
        el.outerHTML = window.ExecutivePatternMemorySummaryCard.render({ kpis: execData.kpis, delay: 0 });
        const newEl = gridContainer.children[7];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 8: FieldOpsStatusCard
    if (window.FieldOpsStatusCard && window.DashboardRenderCache.hasChanged('FieldOpsStatusCard', execData.fieldOpsStatus)) {
      const el = gridContainer.children[8];
      if (el) {
        el.outerHTML = window.FieldOpsStatusCard.render({ fieldOpsStatus: execData.fieldOpsStatus, delay: 0 });
        const newEl = gridContainer.children[8];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 9: DashboardWidgetCard
    if (window.DashboardWidgetCard && window.DashboardWidgetAdapter) {
      const widgetData = window.DashboardWidgetAdapter.getDashboardWidgetData();
      if (window.DashboardRenderCache.hasChanged('DashboardWidgetCard', widgetData.widgets)) {
        const el = gridContainer.children[9];
        if (el) {
          el.outerHTML = window.DashboardWidgetCard.render({ widgets: widgetData.widgets, delay: 0 });
          const newEl = gridContainer.children[9];
          if (newEl) DashboardRenderer.activateMotion(newEl);
        }
      }
    }
    // 10: DashboardLayoutCard
    if (window.DashboardLayoutCard && window.DashboardLayoutAdapter) {
      const layoutData = window.DashboardLayoutAdapter.getDashboardLayoutData();
      if (window.DashboardRenderCache.hasChanged('DashboardLayoutCard', layoutData.activeLayout)) {
        const el = gridContainer.children[10];
        if (el) {
          el.outerHTML = window.DashboardLayoutCard.render({ activeLayout: layoutData.activeLayout, delay: 0 });
          const newEl = gridContainer.children[10];
          if (newEl) DashboardRenderer.activateMotion(newEl);
        }
      }
    }
    // 11: DashboardWorkspaceCard
    if (window.DashboardWorkspaceCard && window.DashboardWorkspaceAdapter) {
      const workspaceData = window.DashboardWorkspaceAdapter.getDashboardWorkspaceData();
      if (window.DashboardRenderCache.hasChanged('DashboardWorkspaceCard', workspaceData.workspaces)) {
        const el = gridContainer.children[11];
        if (el) {
          el.outerHTML = window.DashboardWorkspaceCard.render({ workspaces: workspaceData.workspaces, delay: 0 });
          const newEl = gridContainer.children[11];
          if (newEl) DashboardRenderer.activateMotion(newEl);
        }
      }
    }
    // 12: DashboardStateCard
    if (window.DashboardStateCard && window.DashboardStateAdapter) {
      const stateData = window.DashboardStateAdapter.getDashboardStateData();
      if (window.DashboardRenderCache.hasChanged('DashboardStateCard', stateData)) {
        const el = gridContainer.children[12];
        if (el) {
          el.outerHTML = window.DashboardStateCard.render({ stateData: stateData, delay: 0 });
          const newEl = gridContainer.children[12];
          if (newEl) DashboardRenderer.activateMotion(newEl);
        }
      }
    }
    // 13: DashboardNavigationCard
    if (window.DashboardNavigationCard && window.DashboardNavigationAdapter) {
      const navData = window.DashboardNavigationAdapter.getDashboardNavigationData();
      if (window.DashboardRenderCache.hasChanged('DashboardNavigationCard', navData)) {
        const el = gridContainer.children[13];
        if (el) {
          el.outerHTML = window.DashboardNavigationCard.render({
            navigations: navData.navigations,
            activeNavId: navData.activeNavId,
            delay: 0
          });
          const newEl = gridContainer.children[13];
          if (newEl) DashboardRenderer.activateMotion(newEl);
        }
      }
    }
    // 14: DashboardRenderingCard
    if (window.DashboardRenderingCard && window.DashboardRenderAdapter) {
      const renderData = window.DashboardRenderAdapter.getDashboardRenderData();
      if (window.DashboardRenderCache.hasChanged('DashboardRenderingCard', renderData)) {
        const el = gridContainer.children[14];
        if (el) {
          el.outerHTML = window.DashboardRenderingCard.render({ renderData: renderData, delay: 0 });
          const newEl = gridContainer.children[14];
          if (newEl) DashboardRenderer.activateMotion(newEl);
        }
      }
    }
    // 15: DashboardRuntimeCard
    if (window.DashboardRuntimeCard && window.DashboardRuntimeAdapter) {
      const runtimeData = window.DashboardRuntimeAdapter.getDashboardRuntimeData();
      if (window.DashboardRenderCache.hasChanged('DashboardRuntimeCard', runtimeData)) {
        const el = gridContainer.children[15];
        if (el) {
          el.outerHTML = window.DashboardRuntimeCard.render({ runtimeData: runtimeData, delay: 0 });
          const newEl = gridContainer.children[15];
          if (newEl) DashboardRenderer.activateMotion(newEl);
        }
      }
    }
  }

  /**
   * Mobileビューモード用の全画面差分更新を実行する
   */
  static updateMobileDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.MobileExecutiveAdapter) return;

    const mobData = window.MobileExecutiveAdapter.getMobileData();
    const healthData = window.PipelineHealthAdapter ? window.PipelineHealthAdapter.getHealthData() : { pipelineNodes: [] };

    // 0: MobileHeaderCard
    if (window.MobileHeaderCard && window.DashboardRenderCache.hasChanged('MobileHeaderCard', mobData.kpis)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.MobileHeaderCard.render({ statusState: 'ONLINE', timestamp: new Date().toLocaleTimeString(), delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 1: HierarchyContextCard
    if (window.HierarchyContextCard && window.DashboardRenderCache.hasChanged('HierarchyContextCard', mobData.hierarchyContext)) {
      const el = gridContainer.children[1];
      if (el) {
        el.outerHTML = window.HierarchyContextCard.render({ hierarchyContext: mobData.hierarchyContext, delay: 0 });
        const newEl = gridContainer.children[1];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 2: MobileKPICard
    if (window.MobileKPICard && window.DashboardRenderCache.hasChanged('MobileKPICard', mobData.kpis)) {
      const el = gridContainer.children[2];
      if (el) {
        el.outerHTML = window.MobileKPICard.render({ kpis: mobData.kpis, delay: 0 });
        const newEl = gridContainer.children[2];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 3: MobileFlowCard (Composite props check)
    const mobileFlowProps = { flowGraph: mobData.flowGraph, healthData };
    if (window.MobileFlowCard && window.DashboardRenderCache.hasChanged('MobileFlowCard', mobileFlowProps)) {
      const el = gridContainer.children[3];
      if (el) {
        el.outerHTML = window.MobileFlowCard.render({ flowGraph: mobData.flowGraph, healthData, delay: 0 });
        const newEl = gridContainer.children[3];
        if (newEl) DashboardRenderer.activateMotion(newEl);
        if (window.DashboardMotion && window.DashboardMotion.animateMobileFlow) {
          window.DashboardMotion.animateMobileFlow();
        }
      }
    }
    // 4: MobileActivityCard
    if (window.MobileActivityCard && window.DashboardRenderCache.hasChanged('MobileActivityCard', mobData.activityStream)) {
      const el = gridContainer.children[4];
      if (el) {
        el.outerHTML = window.MobileActivityCard.render({ activityStream: mobData.activityStream, delay: 0 });
        const newEl = gridContainer.children[4];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 5: MobileEvolutionCard
    if (window.MobileEvolutionCard && window.DashboardRenderCache.hasChanged('MobileEvolutionCard', mobData.evolutionStatus)) {
      const el = gridContainer.children[5];
      if (el) {
        el.outerHTML = window.MobileEvolutionCard.render({ evolutionStatus: mobData.evolutionStatus, delay: 0 });
        const newEl = gridContainer.children[5];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
    // 6: MobileMemoryCard
    if (window.MobileMemoryCard && window.DashboardRenderCache.hasChanged('MobileMemoryCard', mobData.kpis)) {
      const el = gridContainer.children[6];
      if (el) {
        el.outerHTML = window.MobileMemoryCard.render({ kpis: mobData.kpis, delay: 0 });
        const newEl = gridContainer.children[6];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Tenantビューモード用の全画面差分更新を実行する
   */
  static updateTenantDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.MultiTenantAdapter) return;

    const tenantData = window.MultiTenantAdapter.getMultiTenantData();

    // 0: MultiTenantSeparationCard
    if (window.MultiTenantSeparationCard && window.DashboardRenderCache.hasChanged('MultiTenantSeparationCard', tenantData.tenants)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.MultiTenantSeparationCard.render({ tenants: tenantData.tenants, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Globalビューモード用の全画面差分更新を実行する
   */
  static updateGlobalDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.MultiTenantExecutiveAdapter) return;

    const summaryData = window.MultiTenantExecutiveAdapter.getMultiTenantExecutiveData();

    // 0: MultiTenantExecutiveCard
    if (window.MultiTenantExecutiveCard && window.DashboardRenderCache.hasChanged('MultiTenantExecutiveCard', summaryData)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.MultiTenantExecutiveCard.render({ summary: summaryData, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Intelligenceビューモード用の全画面差分更新を実行する
   */
  static updateIntelligenceDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.TenantIntelligenceAdapter) return;

    const intelData = window.TenantIntelligenceAdapter.getTenantIntelligenceData();

    // 0: TenantDrilldownCard
    if (window.TenantDrilldownCard && window.DashboardRenderCache.hasChanged('TenantDrilldownCard', intelData.tenantSummary)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.TenantDrilldownCard.render({ summary: intelData.tenantSummary, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }

    // 1: AreaIntelligenceCard
    const areaProps = { areas: intelData.areaSummary, fieldEventSummary: intelData.fieldEventSummary };
    if (window.AreaIntelligenceCard && window.DashboardRenderCache.hasChanged('AreaIntelligenceCard', areaProps)) {
      const el = gridContainer.children[1];
      if (el) {
        el.outerHTML = window.AreaIntelligenceCard.render({ areas: intelData.areaSummary, fieldEventSummary: intelData.fieldEventSummary, delay: 0 });
        const newEl = gridContainer.children[1];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Operationsビューモード用の全画面差分更新を実行する
   */
  static updateOperationsDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.FieldOperationsAdapter) return;

    const opsData = window.FieldOperationsAdapter.getFieldOperationsData();

    // 0: FieldOperationsCard
    if (window.FieldOperationsCard && window.DashboardRenderCache.hasChanged('FieldOperationsCard', opsData.tenantContext)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.FieldOperationsCard.render({ tenantContext: opsData.tenantContext, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }

    // 1: AreaOperationsStatusCard
    if (window.AreaOperationsStatusCard && window.DashboardRenderCache.hasChanged('AreaOperationsStatusCard', opsData.areaOperations)) {
      const el = gridContainer.children[1];
      if (el) {
        el.outerHTML = window.AreaOperationsStatusCard.render({ areaOperations: opsData.areaOperations, delay: 0 });
        const newEl = gridContainer.children[1];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Analyticsビューモード用の全画面差分更新を実行する
   */
  static updateAnalyticsDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.FieldAnalyticsAdapter) return;

    const analyticsData = window.FieldAnalyticsAdapter.getFieldAnalyticsData();

    // 0: FieldAnalyticsTrendCard
    const trendProps = { trendData: analyticsData.trendData, averageCoverage: analyticsData.averageCoverage };
    if (window.FieldAnalyticsTrendCard && window.DashboardRenderCache.hasChanged('FieldAnalyticsTrendCard', trendProps)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.FieldAnalyticsTrendCard.render({ trendData: analyticsData.trendData, averageCoverage: analyticsData.averageCoverage, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }

    // 1: FieldAnalyticsComparisonCard
    const comparisonProps = { areaComparison: analyticsData.areaComparison, coverageHistory: analyticsData.coverageHistory };
    if (window.FieldAnalyticsComparisonCard && window.DashboardRenderCache.hasChanged('FieldAnalyticsComparisonCard', comparisonProps)) {
      const el = gridContainer.children[1];
      if (el) {
        el.outerHTML = window.FieldAnalyticsComparisonCard.render({ areaComparison: analyticsData.areaComparison, coverageHistory: analyticsData.coverageHistory, delay: 0 });
        const newEl = gridContainer.children[1];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Historyビューモード用の全画面差分更新を実行する
   */
  static updateHistoryDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.FieldHistoryAdapter) return;

    const historyData = window.FieldHistoryAdapter.getFieldHistoryData();

    // 0: FieldHistoryTimelineCard
    if (window.FieldHistoryTimelineCard && window.DashboardRenderCache.hasChanged('FieldHistoryTimelineCard', historyData.historyTimeline)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.FieldHistoryTimelineCard.render({ historyTimeline: historyData.historyTimeline, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }

    // 1: HistorySnapshotCard
    if (window.HistorySnapshotCard && window.DashboardRenderCache.hasChanged('HistorySnapshotCard', historyData.historySnapshots)) {
      const el = gridContainer.children[1];
      if (el) {
        el.outerHTML = window.HistorySnapshotCard.render({ historySnapshots: historyData.historySnapshots, delay: 0 });
        const newEl = gridContainer.children[1];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Evidenceビューモード用の全画面差分更新を実行する
   */
  static updateEvidenceDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.FieldEvidenceAdapter) return;

    const evidenceData = window.FieldEvidenceAdapter.getFieldEvidenceData();

    // 0: FieldEvidenceCard
    if (window.FieldEvidenceCard && window.DashboardRenderCache.hasChanged('FieldEvidenceCard', evidenceData.evidenceList)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.FieldEvidenceCard.render({ evidenceList: evidenceData.evidenceList, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Auditビューモード用の全画面差分更新を実行する
   */
  static updateAuditDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.FieldAuditAdapter) return;

    const auditData = window.FieldAuditAdapter.getFieldAuditData();

    // 0: FieldAuditCard
    if (window.FieldAuditCard && window.DashboardRenderCache.hasChanged('FieldAuditCard', auditData.auditList)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.FieldAuditCard.render({ auditList: auditData.auditList, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }

  /**
   * Traceビューモード用の全画面差分更新を実行する
   */
  static updateTraceDashboard() {
    const gridContainer = document.getElementById('dashboard-grid-container');
    if (!gridContainer || !window.FieldTraceAdapter) return;

    const traceData = window.FieldTraceAdapter.getFieldTraceData();

    // 0: FieldTraceCard
    if (window.FieldTraceCard && window.DashboardRenderCache.hasChanged('FieldTraceCard', traceData.traceList)) {
      const el = gridContainer.children[0];
      if (el) {
        el.outerHTML = window.FieldTraceCard.render({ traceList: traceData.traceList, delay: 0 });
        const newEl = gridContainer.children[0];
        if (newEl) DashboardRenderer.activateMotion(newEl);
      }
    }
  }
}

// グローバル公開
window.DashboardRenderer = DashboardRenderer;
