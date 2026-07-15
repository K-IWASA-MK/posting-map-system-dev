/**
 * ScenarioRegressionTest.js
 * 
 * 正常、異常、承認ゲート、および課金隔離の回帰シナリオ検証。
 * 各シナリオが定義通りの期待結果を返すかをアサートする。
 */

const { SimulationRuntime } = require('./runtime/SimulationRuntime');

class ScenarioRegressionTest {
  /**
   * シナリオ回帰テストを実行
   * @param {string} [testRunId]
   * @returns {Promise<array>} 各テストケースの結果配列
   */
  static async run(testRunId = null) {
    const testCases = [
      {
        name: 'Normal Flow Regression',
        scenarioId: 'SCN-NORMAL-001',
        expectedResult: 'Passed'
      },
      {
        name: 'Error Flow Regression',
        scenarioId: 'SCN-ERROR-001',
        expectedResult: 'Failed'
      },
      {
        name: 'Approval Boundary Flow Regression',
        scenarioId: 'SCN-APPROVAL-001',
        expectedResult: 'Passed'
      },
      {
        name: 'Billing Isolation Flow Regression',
        scenarioId: 'SCN-BILLING-ISOLATION-001',
        expectedResult: 'Failed'
      }
    ];

    const results = [];

    for (const tc of testCases) {
      try {
        const result = await SimulationRuntime.run(tc.scenarioId, testRunId);

        if (result.result === tc.expectedResult) {
          results.push({
            name: tc.name,
            status: 'PASS',
            details: `シナリオ ${tc.scenarioId} が期待通りの結果 (${tc.expectedResult}) を返しました。`
          });
        } else {
          results.push({
            name: tc.name,
            status: 'FAIL',
            failedLayer: 'ScenarioRegressionTest',
            error: {
              code: 'SCENARIO_RESULT_MISMATCH',
              message: `アサーション失敗: 期待: ${tc.expectedResult}, 実際: ${result.result}`
            }
          });
        }
      } catch (err) {
        results.push({
          name: tc.name,
          status: 'FAIL',
          failedLayer: 'ScenarioRegressionTest',
          error: { code: 'TEST_EXCEPTION', message: err.message }
        });
      }
    }

    return results;
  }
}

module.exports = { ScenarioRegressionTest };
