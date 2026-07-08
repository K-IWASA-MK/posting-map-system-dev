/**
 * MobileExecutiveAdapter.js
 * 
 * 既存の ExecutiveAdapter をデータ基盤として再利用し、
 * スマートフォンの表示環境に適合したモバイル専用のパラメータセットを生成・返却するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測ロジックの実装は厳禁である。
 */

class MobileExecutiveAdapter {
  /**
   * モバイル向けデータを集約・適合化して取得する
   * @returns {object} モバイル用データオブジェクト
   */
  static getMobileData() {
    // 既存の ExecutiveAdapter からベースデータを取得 (再利用)
    const base = window.ExecutiveAdapter ? window.ExecutiveAdapter.getExecutiveData() : {
      kpis: { activeEvents: 0, knowledgeRecords: 0, patternCount: 0, memoryCapacity: 0, maxMemoryCapacity: 1000 },
      flowGraph: { event: 0, timeline: 0, correlation: 0, graph: 0, knowledge: 0, insight: 0, evolution: 0, pattern: 0, memory: 0 },
      activityStream: [],
      distribution: { runtime: 0, governance: 0, quality: 0, trust: 0, simulation: 0 },
      evolutionStatus: { add: 0, modify: 0, remove: 0 }
    };

    // 1. KPIはそのまま再利用
    const kpis = base.kpis;

    // 2. モバイル用フローの選別 (5大主要レイヤーのみ)
    // 構成: Event ➔ Timeline ➔ Knowledge ➔ Insight ➔ Memory
    const flowGraph = {
      event: base.flowGraph.event,
      timeline: base.flowGraph.timeline,
      knowledge: base.flowGraph.knowledge,
      insight: base.flowGraph.insight,
      memory: base.flowGraph.memory
    };

    // 3. モバイル画面幅に合わせたテキストトリミング (最大 35文字)
    const activityStream = base.activityStream.slice(0, 7).map(item => {
      const trimmedMessage = item.message.length > 35 
        ? item.message.substring(0, 32) + '...' 
        : item.message;
      return {
        timestamp: this.formatMobileTime(item.timestamp),
        category: item.category,
        severity: item.severity,
        message: trimmedMessage
      };
    });

    // 4. 進化ステータス
    const evolutionStatus = base.evolutionStatus;

    return {
      kpis,
      flowGraph,
      activityStream,
      evolutionStatus
    };
  }

  /**
   * モバイル用のコンパクトな時刻形式 (例: "11:51:26" ➔ "11:51")
   */
  static formatMobileTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  }
}

// グローバル公開
window.MobileExecutiveAdapter = MobileExecutiveAdapter;
