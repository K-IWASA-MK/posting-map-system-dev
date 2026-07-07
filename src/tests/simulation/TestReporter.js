/**
 * TestReporter.js
 * 
 * ローカルシミュレーションテストの結果レポートを CLI に出力するレポーター。
 * テストの隠蔽や偽装を一切行わず、結果データをそのまま可視化する。
 */

class TestReporter {
  /**
   * テスト結果を描画
   * @param {object} report 
   */
  static report(report) {
    console.log('\n==================================================');
    console.log('            LOCAL SIMULATION TEST REPORT');
    console.log('==================================================');
    console.log(`Test Run ID  : ${report.testRunId}`);
    console.log(`Timestamp    : ${report.timestamp}`);
    console.log(`Quality Gate : ${report.result === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Failure Count: ${report.failureCount}`);
    console.log('--------------------------------------------------');
    console.log('   TEST CASES DETAIL:');
    console.log('--------------------------------------------------');

    for (const r of report.results) {
      const statusIcon = r.status === 'PASS' ? '✓' : '✗';
      console.log(` [${statusIcon}] ${r.name.padEnd(35)}: ${r.status}`);
      if (r.status === 'FAIL') {
        console.log(`     └─ Failed Layer: ${r.failedLayer}`);
        console.log(`     └─ Error Code  : ${r.error?.code}`);
        console.log(`     └─ Error Msg   : ${r.error?.message}`);
      }
    }

    console.log('==================================================\n');
  }
}

module.exports = { TestReporter };
