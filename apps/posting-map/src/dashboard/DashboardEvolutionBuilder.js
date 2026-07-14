/**
 * DashboardEvolutionBuilder.js
 * 
 * 最新の状態スナップショットと前回の状態スナップショットを客観的に比較し、
 * 構造変化差分（Evolution Object）を自動生成するビルダー。
 * 
 * 警告：本ファイル内への異常判定、自律的解決、RCA分析、AI予測ロジックの実装は厳禁である。
 */

class DashboardEvolutionBuilder {
  static previousSnapshot = [];

  /**
   * 最新のインサイト群と前回のインサイトスナップショットを比較し、
   * 構造変化差分（Evolution Object）のリストを生成する
   * @param {Array} currentInsights 最新インサイトリスト
   * @returns {Array} エボリューションオブジェクトリスト
   */
  static build(currentInsights) {
    if (!currentInsights) return [];

    const evolutions = [];
    const timestamp = new Date().toISOString();

    // 1. ADD / MODIFY 検知
    currentInsights.forEach(curr => {
      const prev = this.previousSnapshot.find(p => p.insightId === curr.insightId);
      
      if (!prev) {
        // 新規追加 (ADD)
        evolutions.push({
          evolutionId: `evo_ins_add_${curr.insightId}_${Date.now()}`,
          sourceType: 'insight',
          sourceId: curr.insightId,
          previousState: null,
          currentState: curr,
          changeType: 'ADD',
          timestamp
        });
      } else {
        // 変更チェック (MODIFY)
        const isChanged = (prev.summary !== curr.summary) || 
                          (prev.trendData?.count !== curr.trendData?.count) ||
                          (prev.trendData?.ratio !== curr.trendData?.ratio);

        if (isChanged) {
          evolutions.push({
            evolutionId: `evo_ins_mod_${curr.insightId}_${Date.now()}`,
            sourceType: 'insight',
            sourceId: curr.insightId,
            previousState: prev,
            currentState: curr,
            changeType: 'MODIFY',
            timestamp
          });
        }
      }
    });

    // 2. REMOVE 検知
    this.previousSnapshot.forEach(prev => {
      const curr = currentInsights.find(c => c.insightId === prev.insightId);
      if (!curr) {
        evolutions.push({
          evolutionId: `evo_ins_rm_${prev.insightId}_${Date.now()}`,
          sourceType: 'insight',
          sourceId: prev.insightId,
          previousState: prev,
          currentState: null,
          changeType: 'REMOVE',
          timestamp
        });
      }
    });

    // 次回比較用に保存
    this.previousSnapshot = currentInsights.map(ins => ({
      insightId: ins.insightId,
      category: ins.category,
      summary: ins.summary,
      trendData: ins.trendData ? { ...ins.trendData } : null
    }));

    return evolutions;
  }
}

// グローバル公開
window.DashboardEvolutionBuilder = DashboardEvolutionBuilder;
