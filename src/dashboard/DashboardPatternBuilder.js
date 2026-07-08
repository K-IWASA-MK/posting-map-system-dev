/**
 * DashboardPatternBuilder.js
 * 
 * エボリューションデータから構造シグネチャを静的にグループ化し、
 * 発生回数を集計したパターンオブジェクト（Pattern Object）を生成するビルダー。
 * 
 * 警告：本ファイル内への異常検知、AI学習、予測判定ロジックの実装は厳禁である。
 */

class DashboardPatternBuilder {
  /**
   * エボリューションリストから表示用パターンデータを集計構築する
   * @param {Array} evolutions エボリューションリスト
   * @returns {Array} パターンオブジェクトリスト
   */
  static build(evolutions) {
    if (!evolutions || evolutions.length === 0) return [];

    const patternMap = {};

    evolutions.forEach(evo => {
      const changeType = evo.changeType || 'MODIFY';
      const sourceType = evo.sourceType || 'insight';
      const category = evo.currentState ? evo.currentState.category : (evo.previousState ? evo.previousState.category : 'runtime');

      // 静的なシグネチャ定義 (推論を含まない)
      const signature = `SIG_${sourceType.toUpperCase()}_${changeType.toUpperCase()}_${category.toUpperCase()}`;

      if (!patternMap[signature]) {
        patternMap[signature] = {
          associatedEvolutionIds: [],
          category,
          lastObserved: evo.timestamp
        };
      }

      patternMap[signature].associatedEvolutionIds.push(evo.evolutionId);
      
      const currentLastObserved = new Date(patternMap[signature].lastObserved).getTime();
      const evoTime = new Date(evo.timestamp).getTime();
      if (evoTime > currentLastObserved) {
        patternMap[signature].lastObserved = evo.timestamp;
      }
    });

    const patterns = [];
    Object.keys(patternMap).forEach(sig => {
      const data = patternMap[sig];
      const count = data.associatedEvolutionIds.length;
      const patternId = `pat_${sig}_${Date.now()}`;

      patterns.push({
        patternId,
        signature: sig,
        occurrenceCount: count,
        associatedEvolutionIds: data.associatedEvolutionIds,
        category: data.category,
        lastObserved: data.lastObserved
      });
    });

    return patterns;
  }
}

// グローバル公開
window.DashboardPatternBuilder = DashboardPatternBuilder;
