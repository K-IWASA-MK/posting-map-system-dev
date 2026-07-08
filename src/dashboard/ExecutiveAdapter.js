/**
 * ExecutiveAdapter.js
 * 
 * 8つのインテリジェンスレイヤー（Timeline/Correlation/Graph/Knowledge/Insight/Evolution/Pattern/Memory）
 * の内部データストアからデータを取得し、エグゼクティブ向けのマクロ情報へと集約・加工するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class ExecutiveAdapter {
  static temporalSnapshots = {
    activeEvents: null,
    knowledgeRecords: null,
    patternCount: null,
    memoryCapacity: null
  };

  /**
   * 単一メトリクスに対する Immutable な Temporal Snapshot を計算・更新する
   * @param {string} metricId 
   * @param {number} currentValue 
   * @returns {object} Immutable Temporal KPI Object
   */
  static computeTemporalSnapshot(metricId, currentValue) {
    const now = new Date().toISOString();
    const lastSnapshot = this.temporalSnapshots[metricId];

    if (!lastSnapshot) {
      // 初回生成 (PreviousValue = CurrentValue)
      const snap = Object.freeze({
        metricId,
        currentValue,
        previousValue: currentValue,
        capturedAt: now,
        previousCapturedAt: now,
        delta: 0,
        deltaRate: 0,
        trendDirection: 'STABLE',
        statusLabel: 'NORMAL'
      });
      this.temporalSnapshots[metricId] = snap;
      return snap;
    }

    if (lastSnapshot.currentValue === currentValue) {
      // 値に変更がない場合は前回のスナップショットをそのまま維持して再利用
      return lastSnapshot;
    }

    // 値が変化した場合のみ、差分計算を行ってスナップショットを更新
    const previousValue = lastSnapshot.currentValue;
    const delta = currentValue - previousValue;
    const deltaRate = previousValue === 0 ? 0 : parseFloat(((delta / previousValue) * 100).toFixed(1));
    
    let trendDirection = 'STABLE';
    if (delta > 0) trendDirection = 'UP';
    else if (delta < 0) trendDirection = 'DOWN';

    const absRate = Math.abs(deltaRate);
    let statusLabel = 'NORMAL';
    if (absRate > 70) statusLabel = 'SIGNIFICANT';
    else if (absRate > 30) statusLabel = 'HIGH';

    const newSnap = Object.freeze({
      metricId,
      currentValue,
      previousValue,
      capturedAt: now,
      previousCapturedAt: lastSnapshot.capturedAt,
      delta,
      deltaRate,
      trendDirection,
      statusLabel
    });

    this.temporalSnapshots[metricId] = newSnap;
    return newSnap;
  }

  /**
   * 8つのレイヤーからデータを集約してエグゼクティブ向けデータを生成する
   * @returns {object} エグゼクティブ用データオブジェクト
   */
  static getExecutiveData() {
    const timeline = window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline() : [];
    const knowledges = window.DashboardEventKnowledgeStore ? window.DashboardEventKnowledgeStore.getKnowledges() : [];
    const patterns = window.DashboardEventPatternStore ? window.DashboardEventPatternStore.getPatterns() : [];
    const memories = window.DashboardEventMemoryStore ? window.DashboardEventMemoryStore.getMemories() : [];
    const correlations = window.DashboardEventCorrelationStore ? window.DashboardEventCorrelationStore.getCorrelations() : [];
    const graphs = window.DashboardEventGraphStore ? window.DashboardEventGraphStore.getGraphs() : [];
    const insights = window.DashboardEventInsightStore ? window.DashboardEventInsightStore.getInsights() : [];
    const evolutions = window.DashboardEventEvolutionStore ? window.DashboardEventEvolutionStore.getEvolutions() : [];

    // 1. KPI集計 (Immutable Temporal Snapshots)
    const kpis = {
      activeEvents: this.computeTemporalSnapshot('activeEvents', timeline.length),
      knowledgeRecords: this.computeTemporalSnapshot('knowledgeRecords', knowledges.length),
      patternCount: this.computeTemporalSnapshot('patternCount', patterns.length),
      memoryCapacity: this.computeTemporalSnapshot('memoryCapacity', memories.length),
      maxMemoryCapacity: window.DashboardEventMemoryStore ? window.DashboardEventMemoryStore.maxCapacity : 1000
    };

    // 2. パイプライン・フロー状態 (Flow Graph用件数)
    const flowGraph = {
      event: timeline.length > 0 ? 1 : 0,
      timeline: timeline.length,
      correlation: correlations.length,
      graph: graphs.length,
      knowledge: knowledges.length,
      insight: insights.length,
      evolution: evolutions.length,
      pattern: patterns.length,
      memory: memories.length
    };

    // 3. ルールベースによる活動ログの要約 (Activity Stream)
    const activityStream = timeline.slice(0, 10).map(evt => {
      return {
        timestamp: evt.timestamp,
        category: evt.category,
        severity: evt.severity,
        message: this.formatActivityMessage(evt.message)
      };
    });

    // 4. カテゴリ分布 (Distribution)
    const distribution = this.calculateDistribution(timeline);

    // 5. 変化タイプの統計 (Evolution Status)
    const evolutionStatus = this.calculateEvolutionStatus(evolutions);

    return {
      kpis,
      flowGraph,
      activityStream,
      distribution,
      evolutionStatus
    };
  }

  /**
   * 技術的メッセージを非技術的・マクロ記述にルールベースで静的に変換する
   * @param {string} msg 元のメッセージ
   * @returns {string} 変換後のメッセージ
   */
  static formatActivityMessage(msg) {
    if (!msg) return '';

    // 静的マッピングルール定義
    const rules = [
      {
        pattern: /database connection established/i,
        replace: 'Runtime: Database link established'
      },
      {
        pattern: /unexpected rule mutation rate/i,
        replace: 'Governance: Policy mutation activity detected'
      },
      {
        pattern: /token verification latency/i,
        replace: 'Security: Latency warning in validation key'
      },
      {
        pattern: /performance optimization job completed/i,
        replace: 'Runtime: Resource optimization job completed'
      },
      {
        pattern: /Local Simulation PASS/i,
        replace: 'Simulation: Standard regression test successful'
      },
      {
        pattern: /Regression audit PASS/i,
        replace: 'Quality: Regression safety checks completed'
      },
      {
        pattern: /Boundary protection check active/i,
        replace: 'Governance: Environment boundary guards validated'
      }
    ];

    for (let i = 0; i < rules.length; i++) {
      if (rules[i].pattern.test(msg)) {
        return rules[i].replace;
      }
    }

    // どのパターンにも合致しない場合は適度に簡略化して返す
    return msg.length > 50 ? msg.substring(0, 47) + '...' : msg;
  }

  /**
   * カテゴリ別の比率を集計する
   */
  static calculateDistribution(timeline) {
    const total = timeline.length;
    const counts = { runtime: 0, governance: 0, quality: 0, trust: 0, simulation: 0 };

    if (total === 0) {
      return counts;
    }

    timeline.forEach(evt => {
      const cat = (evt.category || 'runtime').toLowerCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.runtime++; // 不明なカテゴリは runtime にマージ
      }
    });

    // 割合（％）に変換
    return {
      runtime: Math.round((counts.runtime / total) * 100),
      governance: Math.round((counts.governance / total) * 100),
      quality: Math.round((counts.quality / total) * 100),
      trust: Math.round((counts.trust / total) * 100),
      simulation: Math.round((counts.simulation / total) * 100)
    };
  }

  /**
   * Evolution変更タイプの数を集計する
   */
  static calculateEvolutionStatus(evolutions) {
    const counts = { add: 0, modify: 0, remove: 0 };
    evolutions.forEach(evo => {
      const type = (evo.changeType || 'modify').toLowerCase();
      if (type === 'add') counts.add++;
      else if (type === 'remove') counts.remove++;
      else counts.modify++;
    });
    return counts;
  }
}

// グローバル公開
window.ExecutiveAdapter = ExecutiveAdapter;
