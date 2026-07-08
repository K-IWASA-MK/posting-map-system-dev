/**
 * PipelineHealthAdapter.js
 * 
 * 既存の各ストア (Timeline, Knowledge, Insight, Evolution, Pattern, Memory) 
 * からデータを抽出し、latency / bufferSize / status 等を決定論的ルールで算出して
 * 経営ビューにマッピングする読み取り専用のアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class PipelineHealthAdapter {
  /**
   * 総合 Status を算出する (決定論的静的ルール)
   * CONGESTED ＞ ATTENTION ＞ HEALTHY
   */
  static determineStatus(latencyVal, bufferVal) {
    let latencyStatus = "HEALTHY";
    if (latencyVal > 500) {
      latencyStatus = "CONGESTED";
    } else if (latencyVal > 100) {
      latencyStatus = "ATTENTION";
    }

    let bufferStatus = "HEALTHY";
    if (bufferVal > 80) {
      bufferStatus = "CONGESTED";
    } else if (bufferVal > 50) {
      bufferStatus = "ATTENTION";
    }

    if (latencyStatus === "CONGESTED" || bufferStatus === "CONGESTED") {
      return "CONGESTED";
    }
    if (latencyStatus === "ATTENTION" || bufferStatus === "ATTENTION") {
      return "ATTENTION";
    }
    return "HEALTHY";
  }

  /**
   * パイプライン状態を全レイヤーについて集約取得する
   * @returns {object} Pipeline Health View Model
   */
  static getHealthData() {
    // 既存各ストアのデータ件数を安全に取得
    const timelineCount = window.DashboardEventTimelineStore ? window.DashboardEventTimelineStore.getTimeline().length : 0;
    const correlationCount = window.DashboardEventCorrelationStore ? window.DashboardEventCorrelationStore.getCorrelations().length : 0;
    const graphCount = window.DashboardEventGraphStore ? window.DashboardEventGraphStore.getGraphs().length : 0;
    const knowledgeCount = window.DashboardEventKnowledgeStore ? window.DashboardEventKnowledgeStore.getKnowledges().length : 0;
    const insightCount = window.DashboardEventInsightStore ? window.DashboardEventInsightStore.getInsights().length : 0;
    const evolutionCount = window.DashboardEventEvolutionStore ? window.DashboardEventEvolutionStore.getEvolutions().length : 0;
    const patternCount = window.DashboardEventPatternStore ? window.DashboardEventPatternStore.getPatterns().length : 0;
    const memoryCount = window.DashboardEventMemoryStore ? window.DashboardEventMemoryStore.getMemories().length : 0;
    const maxMemory = window.DashboardEventMemoryStore ? window.DashboardEventMemoryStore.maxCapacity : 1000;

    // 1. 各レイヤーの客観的メトリクス算出
    // Timeline
    const timelineLatency = 15 + Math.round(timelineCount * 0.1);
    const timelineBuffer = Math.min(100, Math.round((timelineCount / 1000) * 100));
    const timelineNode = Object.freeze({
      layerName: "Timeline",
      processedCount: timelineCount,
      latency: Object.freeze({ value: timelineLatency, source: "SIMULATION" }),
      bufferSize: timelineBuffer,
      status: this.determineStatus(timelineLatency, timelineBuffer)
    });

    // Correlation
    const correlationLatency = 10 + Math.round(correlationCount * 0.1);
    const correlationBuffer = Math.min(100, Math.round((correlationCount / 500) * 100));
    const correlationNode = Object.freeze({
      layerName: "Correlation",
      processedCount: correlationCount,
      latency: Object.freeze({ value: correlationLatency, source: "SIMULATION" }),
      bufferSize: correlationBuffer,
      status: this.determineStatus(correlationLatency, correlationBuffer)
    });

    // Graph
    const graphLatency = 12 + Math.round(graphCount * 0.12);
    const graphBuffer = Math.min(100, Math.round((graphCount / 1000) * 100));
    const graphNode = Object.freeze({
      layerName: "Graph",
      processedCount: graphCount,
      latency: Object.freeze({ value: graphLatency, source: "SIMULATION" }),
      bufferSize: graphBuffer,
      status: this.determineStatus(graphLatency, graphBuffer)
    });

    // Knowledge
    const knowledgeLatency = 25 + Math.round(knowledgeCount * 0.15);
    const knowledgeBuffer = Math.min(100, Math.round((knowledgeCount / 1000) * 100));
    const knowledgeNode = Object.freeze({
      layerName: "Knowledge",
      processedCount: knowledgeCount,
      latency: Object.freeze({ value: knowledgeLatency, source: "SIMULATION" }),
      bufferSize: knowledgeBuffer,
      status: this.determineStatus(knowledgeLatency, knowledgeBuffer)
    });

    // Insight
    const insightLatency = 30 + Math.round(insightCount * 0.5);
    const insightBuffer = Math.min(100, Math.round((insightCount / 200) * 100));
    const insightNode = Object.freeze({
      layerName: "Insight",
      processedCount: insightCount,
      latency: Object.freeze({ value: insightLatency, source: "SIMULATION" }),
      bufferSize: insightBuffer,
      status: this.determineStatus(insightLatency, insightBuffer)
    });

    // Evolution
    const evolutionLatency = 40 + Math.round(evolutionCount * 0.8);
    const evolutionBuffer = Math.min(100, Math.round((evolutionCount / 500) * 100));
    const evolutionNode = Object.freeze({
      layerName: "Evolution",
      processedCount: evolutionCount,
      latency: Object.freeze({ value: evolutionLatency, source: "SIMULATION" }),
      bufferSize: evolutionBuffer,
      status: this.determineStatus(evolutionLatency, evolutionBuffer)
    });

    // Pattern
    const patternLatency = 50 + Math.round(patternCount * 1.5);
    const patternBuffer = Math.min(100, Math.round((patternCount / 300) * 100));
    const patternNode = Object.freeze({
      layerName: "Pattern",
      processedCount: patternCount,
      latency: Object.freeze({ value: patternLatency, source: "SIMULATION" }),
      bufferSize: patternBuffer,
      status: this.determineStatus(patternLatency, patternBuffer)
    });

    // Memory
    const memoryLatency = 10 + Math.round(memoryCount * 0.05);
    const memoryBuffer = Math.min(100, Math.round((memoryCount / maxMemory) * 100));
    const memoryNode = Object.freeze({
      layerName: "Memory",
      processedCount: memoryCount,
      latency: Object.freeze({ value: memoryLatency, source: "SIMULATION" }),
      bufferSize: memoryBuffer,
      status: this.determineStatus(memoryLatency, memoryBuffer)
    });

    // ビューモデル配列の構築と不変アタッチ
    const nodes = Object.freeze([
      timelineNode,
      correlationNode,
      graphNode,
      knowledgeNode,
      insightNode,
      evolutionNode,
      patternNode,
      memoryNode
    ]);

    return Object.freeze({
      pipelineNodes: nodes
    });
  }
}

// グローバル公開
window.PipelineHealthAdapter = PipelineHealthAdapter;
