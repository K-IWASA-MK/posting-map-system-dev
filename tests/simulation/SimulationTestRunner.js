/**
 * SimulationTestRunner.js
 * 
 * ローカルシミュレーションテストスイートの統制と結果集約を行う実行ランタイム。
 * Quality Gate 思想に従い、接続契約、シナリオ、本番隔離境界の自動検証を行う。
 */

const { ContractRegressionTest } = require('./ContractRegressionTest');
const { ScenarioRegressionTest } = require('./ScenarioRegressionTest');
const { BoundaryTest } = require('./BoundaryTest');
const { TestReporter } = require('./TestReporter');
const { AuditWriter } = require('./runtime/AuditWriter');

class SimulationTestRunner {
  /**
   * テストスイートを全実行する
   * @param {string} [customRunId]
   * @returns {Promise<object>} TestResultReport
   */
  static async runAll(customRunId = null) {
    const testRunId = customRunId || `TST-RUN-${Date.now()}`;
    const startTime = new Date().toISOString();

    // 1. テスト開始監査記録 (Append-Only)
    await AuditWriter.write(testRunId, 'TestStarted', {
      timestamp: startTime
    });

    console.log(`[Test Runner] テストスイートを開始します。Run ID: ${testRunId}`);

    // 各テストケースの定義と実行
    const results = [];

    // Test 1: 境界テスト (Boundary Test)
    console.log('[Test Runner] 1. 本番隔離境界の検証を実行中...');
    const boundaryRes = await BoundaryTest.run();
    results.push({ name: 'Boundary Isolation Test', ...boundaryRes });

    // Test 2: コントラクト回帰テスト (Contract Regression Test)
    console.log('[Test Runner] 2. 接続契約回帰の検証を実行中...');
    const contractRes = await ContractRegressionTest.run(testRunId);
    results.push({ name: 'Contract Regression Test', ...contractRes });

    // Test 3: シナリオ回帰テスト (Scenario Regression Test)
    console.log('[Test Runner] 3. シナリオ回帰の検証を実行中...');
    const scenarioRes = await ScenarioRegressionTest.run(testRunId);
    results.push(...scenarioRes);

    // 2. 結果集約と Quality Gate 判定
    let overallResult = 'PASS';
    let failedTestCount = 0;

    for (const r of results) {
      // 監査にテストケース判定を追記
      await AuditWriter.write(testRunId, 'RegressionValidated', {
        testCaseName: r.name,
        status: r.status,
        failedLayer: r.failedLayer || '',
        errorMessage: r.error?.message || ''
      });

      if (r.status === 'FAIL') {
        overallResult = 'FAIL';
        failedTestCount++;
      }
    }

    const endTime = new Date().toISOString();
    const report = {
      testRunId,
      result: overallResult,
      failureCount: failedTestCount,
      timestamp: endTime,
      results
    };

    // 3. テスト終了監査記録 (Append-Only)
    await AuditWriter.write(testRunId, 'TestEnded', {
      result: overallResult,
      failureCount: failedTestCount,
      timestamp: endTime
    });

    // 4. レポートの出力
    TestReporter.report(report);

    return report;
  }
}

module.exports = { SimulationTestRunner };
