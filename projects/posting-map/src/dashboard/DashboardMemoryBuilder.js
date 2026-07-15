/**
 * DashboardMemoryBuilder.js
 * 
 * 抽出されたパターンデータおよびエボリューション履歴から、
 * 長期スナップショットを含むメモリレコード（Memory Object）を生成するビルダー。
 * 
 * 警告：本ファイル内への自己改善、異常判定、推奨生成、AI予測ロジックの実装は厳禁である。
 */

class DashboardMemoryBuilder {
  /**
   * パターンデータからメモリレコードを構築する
   * @param {Array} patterns 最新パターンリスト
   * @returns {Array} メモリオブジェクトリスト
   */
  static build(patterns) {
    if (!patterns || patterns.length === 0) return [];

    const memories = [];
    const createdAt = new Date().toISOString();

    patterns.forEach(pat => {
      const memoryId = `mem_pat_${pat.patternId}_${Date.now()}`;

      memories.push({
        memoryId,
        sourceType: 'pattern',
        sourceId: pat.patternId,
        // スナップショット状態のコピー
        snapshot: {
          signature: pat.signature,
          occurrenceCount: pat.occurrenceCount,
          lastObserved: pat.lastObserved
        },
        createdAt,
        category: pat.category || 'runtime',
        referenceIds: pat.associatedEvolutionIds ? [...pat.associatedEvolutionIds] : []
      });
    });

    return memories;
  }
}

// グローバル公開
window.DashboardMemoryBuilder = DashboardMemoryBuilder;
