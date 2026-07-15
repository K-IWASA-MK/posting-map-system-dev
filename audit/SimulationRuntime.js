/**
 * SimulationRuntime.js
 * 
 * 統合シミュレーションの実行ライフサイクルを統制するランタイムクラス。
 * 本番AIOS環境から完全に論理隔離されたサンドボックス環境として機能する。
 */

const { ScenarioRunner } = require('./ScenarioRunner');
const { ResultGenerator } = require('./ResultGenerator');
const { AuditWriter } = require('./AuditWriter');

class SimulationRuntime {
  /**
   * シミュレーションの実行をトリガーする
   * @param {string} scenarioId 
   * @param {string} [customSimulationId]
   * @returns {Promise<object>} SimulationResult
   */
  static async run(scenarioId, customSimulationId = null) {
    const simulationId = customSimulationId || `SIM-${Date.now()}`;
    const startTime = new Date().toISOString();

    // 1. 監査開始イベントの追記 (Append-Only)
    await AuditWriter.write(simulationId, 'ScenarioStarted', {
      scenarioId,
      timestamp: startTime
    });

    let runnerResult;
    try {
      // 2. シナリオランナーの初期化と実行
      const runner = new ScenarioRunner(simulationId, scenarioId);
      runnerResult = await runner.execute();
    } catch (error) {
      runnerResult = {
        status: 'Failed',
        failedLayer: 'RuntimeEngine',
        error: {
          code: 'RUNTIME_EXCEPTION',
          message: error.message
        }
      };
    }

    const endTime = new Date().toISOString();

    // 3. シミュレーション結果オブジェクトの生成
    const resultRecord = ResultGenerator.generate({
      simulationId,
      scenarioId,
      startTime,
      endTime,
      result: runnerResult.status,
      failedLayer: runnerResult.failedLayer || '',
      error: runnerResult.error || null
    });

    // 4. 監査終了イベントの記録 (Append-Only)
    await AuditWriter.write(simulationId, 'ScenarioEnded', {
      scenarioId,
      result: resultRecord.result,
      failedLayer: resultRecord.failedLayer,
      timestamp: endTime
    });

    return resultRecord;
  }
}

module.exports = { SimulationRuntime };
