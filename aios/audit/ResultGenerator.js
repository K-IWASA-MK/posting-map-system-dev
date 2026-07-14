/**
 * ResultGenerator.js
 * 
 * 実行されたシミュレーションセッションの結果データ構造（SimulationResultRecord）を決定論的に生成するジェネレーター。
 */

class ResultGenerator {
  /**
   * シミュレーション結果オブジェクトを生成する
   * @param {object} params 
   * @returns {object} Result Record
   */
  static generate({ simulationId, scenarioId, startTime, endTime, result, failedLayer, error }) {
    return {
      simulationId,
      scenarioId,
      startTime,
      endTime,
      result: result === 'Passed' ? 'Passed' : 'Failed',
      failedLayer: failedLayer || '',
      error: error ? {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || '例外が発生しました。'
      } : null,
      auditReference: `audit_logs/simulation_${simulationId}.json`
    };
  }
}

module.exports = { ResultGenerator };
