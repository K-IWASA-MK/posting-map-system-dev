/**
 * DashboardEvolutionAdapter.js
 * 
 * エボリューションオブジェクトを表示用ビューモデルへマッピングするアダプター。
 */

class DashboardEvolutionAdapter {
  /**
   * エボリューションオブジェクトを表示用モデルにマッピングする
   * @param {object} evo 
   * @returns {object} ビューモデル
   */
  static adapt(evo) {
    if (!evo) return null;

    const source = evo.sourceType ? evo.sourceType.toUpperCase() : 'UNKNOWN';
    const changeType = evo.changeType || 'MODIFY';

    const beforeText = evo.previousState ? 
      (evo.previousState.summary || `Count: ${evo.previousState.trendData?.count || 0}`) : 'N/A (NEW)';

    const afterText = evo.currentState ? 
      (evo.currentState.summary || `Count: ${evo.currentState.trendData?.count || 0}`) : 'N/A (REMOVED)';

    const title = `Telemetry change in ${source} [Ref: ${evo.sourceId}]`;

    return {
      evolutionId: evo.evolutionId,
      title,
      changeType,
      beforeText,
      afterText,
      timeRange: evo.timestamp || 'N/A',
      source
    };
  }
}

// グローバル公開
window.DashboardEvolutionAdapter = DashboardEvolutionAdapter;
