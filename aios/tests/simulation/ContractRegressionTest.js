/**
 * ContractRegressionTest.js
 * 
 * 接続契約回帰（スキーマ変更、必須キー欠落等）の検証。
 * 必須キー欠落の異常データが流れた際に、決定論的に FAIL と判定されるかを検証する。
 */

const { SimulationRuntime } = require('../../audit/SimulationRuntime');

class ContractRegressionTest {
  /**
   * テストを実行
   * @param {string} [testRunId]
   * @returns {Promise<object>} Status
   */
  static async run(testRunId = null) {
    try {
      // 接続契約違反シナリオ（必須キー 'compiledFiles' 欠落）を実行
      const result = await SimulationRuntime.run('SCN-CONTRACT-FAIL-001', testRunId);

      // 期待される結果: Failed (契約違反を正しく検知して処理を遮断)
      if (result.result === 'Failed' && result.failedLayer === 'MockReviewKernel') {
        return {
          status: 'PASS',
          details: '必須フィールドの欠落が契約バリデーターによって正常に検出され、Failed 判定となりました。'
        };
      } else {
        return {
          status: 'FAIL',
          failedLayer: 'ContractRegressionTest',
          error: {
            code: 'CONTRACT_FAIL_IGNORED',
            message: `アサーション失敗: 接続契約違反（必須フィールド不足）が正しく検出されませんでした。期待: Failed, 実際: ${result.result}`
          }
        };
      }
    } catch (err) {
      return {
        status: 'FAIL',
        failedLayer: 'ContractRegressionTest',
        error: { code: 'TEST_EXCEPTION', message: err.message }
      };
    }
  }
}

module.exports = { ContractRegressionTest };
