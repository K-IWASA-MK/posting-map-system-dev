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
            const newCard = gridContainer.children[idx];
            if (newCard) {
              newCard.classList.add('motion-active');
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
}

// グローバル公開
window.DashboardRenderer = DashboardRenderer;
