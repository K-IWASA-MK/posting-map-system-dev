/**
 * hook_runner.js
 * 
 * Git pre-commitフックやデプロイ前フックからの要求を仲介し、
 * SimulationTestRunner を呼び出して Exit Code（0 または 1）による遮断（Block）を統制するランタイム。
 * 
 * 警告：本ファイル内にテスト回避（Bypass）や強制パス、自動修正ロジックを記述することは厳禁である。
 */

const { SimulationTestRunner } = require('../../tests/simulation/SimulationTestRunner');
const { AuditWriter } = require('../../tests/simulation/runtime/AuditWriter');

class HookRunner {
  /**
   * フック実行を統制する
   * @param {string} eventSource 'git-pre-commit' または 'clasp-pre-deploy'
   * @param {string} commandName
   */
  static async run(eventSource, commandName) {
    const hookId = `HK-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. フック起動イベントの監査記録 (Append-Only)
    // テストスイート自体のRun IDはテストランナー側で発行されるため、フック起動時の暫定IDを使用
    const tempRunId = `TST-RUN-INIT-${hookId}`;
    await AuditWriter.write(tempRunId, 'HookTriggered', {
      hookId,
      eventSource,
      commandName,
      timestamp,
      environment: 'local-dev',
      repository: 'posting-map-system'
    });

    console.log(`[Simulation Hook] 品質ゲート検証を開始します... Source: ${eventSource}`);

    let gateExitCode = 1;
    let gateResult = 'Blocked';
    let activeRunId = tempRunId;

    try {
      // 2. テストスイートの起動
      const report = await SimulationTestRunner.runAll(tempRunId);
      activeRunId = report.testRunId;

      // 3. Quality Gate アサーションに基づく合否判定
      if (report.result === 'PASS') {
        gateExitCode = 0; // Allow
        gateResult = 'Passed';
        console.log(`[Simulation Hook] QUALITY GATE: PASS. 変更操作が許可されました。`);
      } else {
        gateExitCode = 1; // Block
        gateResult = 'Blocked';
        console.error(`[Simulation Hook] QUALITY GATE: BLOCKED. 接続契約または本番隔離違反を検知したため処理を中断します。`);
      }
    } catch (error) {
      console.error(`[Simulation Hook] フック実行中に致命的なエラーが発生しました:`, error.message);
      gateExitCode = 1; // Block
      gateResult = 'Blocked';
    }

    // 4. フック完了イベントの不変監査記録 (Append-Only)
    await AuditWriter.write(activeRunId, 'HookCompleted', {
      hookId,
      eventSource,
      commandName,
      gateResult,
      exitCode: gateExitCode,
      timestamp: new Date().toISOString(),
      environment: 'local-dev',
      repository: 'posting-map-system'
    });

    // 決定論的な結果コードを返し、Git/Deploy プロセスを Allow/Block 制御
    process.exit(gateExitCode);
  }
}

// CLI引数の受け取り
if (require.main === module) {
  const args = process.argv.slice(2);
  const eventSource = args[0] || 'unknown-hook';
  const commandName = args[1] || 'unknown-command';
  HookRunner.run(eventSource, commandName);
}

module.exports = { HookRunner };
