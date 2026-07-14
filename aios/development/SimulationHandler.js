/**
 * SimulationHandler.js
 * 
 * CLIからの `simulate-kernel-flow` 要求を受け付けるハンドラー。
 * 本番カーネル実行（Production Command）への接続経路を一切持たず、シミュレーションランタイムをトリガーする。
 */

const { SimulationRuntime } = require('../audit/SimulationRuntime');

class SimulationHandler {
  /**
   * シミュレーションコマンドを実行
   * @param {string} scenarioId 
   */
  static async handle(scenarioId) {
    if (!scenarioId) {
      console.error('エラー: シナリオID（引数）を指定してください。');
      console.log('使用例: node src/cli/SimulationHandler.js SCN-NORMAL-001');
      process.exit(1);
    }

    console.log(`[Simulation CLI] 統合検証シミュレーションを開始します。シナリオ: ${scenarioId}`);
    
    try {
      const result = await SimulationRuntime.run(scenarioId);
      
      console.log('\n======================================');
      console.log('   シミュレーション実行完了');
      console.log('======================================');
      console.log(`Simulation ID  : ${result.simulationId}`);
      console.log(`Scenario ID    : ${result.scenarioId}`);
      console.log(`Result         : ${result.result === 'Passed' ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (result.result === 'Failed') {
        console.log(`Failed Layer   : ${result.failedLayer}`);
        console.log(`Error Code     : ${result.error?.code}`);
        console.log(`Error Message  : ${result.error?.message}`);
      }

      console.log(`Audit Log Ref  : ${result.auditReference}`);
      console.log('======================================\n');

      return result;
    } catch (err) {
      console.error('シミュレーション実行中に想定外の例外が発生しました:', err.message);
      process.exit(1);
    }
  }
}

// コマンドラインから直接実行された場合の簡易ルーティング
if (require.main === module) {
  const args = process.argv.slice(2);
  SimulationHandler.handle(args[0]);
}

module.exports = { SimulationHandler };
