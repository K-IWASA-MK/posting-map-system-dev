import { ExecutionCoordinator } from '../../../../../sdk/core/bootstrap/ExecutionCoordinator';
import { DevelopmentRuleEngine } from '../../../../../sdk/core/engine/DevelopmentRuleEngine';
import { DevelopmentGovernanceEngine } from '../../../../../sdk/core/governance/DevelopmentGovernanceEngine';
import { PluginRegistry } from '../../../../../sdk/core/engine/PluginRegistry';
import { DevelopmentContextBuilder } from '../../../../../sdk/core/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../sdk/core/context/DevelopmentContextType';
import { ExecutionRecorder } from '../../../../../sdk/core/ledger/ExecutionRecorder';
import { JsonExecutionLedgerAdapter } from '../../../../../sdk/core/ledger/JsonExecutionLedgerAdapter';
import * as fs from 'fs';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running ExecutionCoordinator tests...');
  
  const registry = new PluginRegistry();
  const engine = new DevelopmentRuleEngine(registry);
  const governance = new DevelopmentGovernanceEngine();
  const coordinator = new ExecutionCoordinator(engine, governance);

  const adapter = new JsonExecutionLedgerAdapter('/tmp/aios_coord_test.json');
  const recorder = new ExecutionRecorder(adapter, 'EXEC-C1', 'CORR-C1');

  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('posting-map')
    .build();

  // Test normal execution
  const result = await coordinator.run(context, recorder);
  assert(result !== undefined, 'Coordinator should return governance result');

  // Test error recovery/propagation (Mocking a failing engine)
  const failingEngine = {
    execute: async () => { throw new Error("Simulated Engine Crash"); }
  } as any;
  const errorCoordinator = new ExecutionCoordinator(failingEngine, governance);
  const errRecorder = new ExecutionRecorder(adapter, 'EXEC-ERR', 'CORR-ERR');
  
  let crashed = false;
  try {
    await errorCoordinator.run(context, errRecorder);
  } catch (e: any) {
    crashed = true;
    assert(e.message === 'Simulated Engine Crash', 'Should propagate error');
  }
  assert(crashed, 'Coordinator should throw on engine crash');

  // Verify Ledger was recorded correctly before crash
  const ledger = await adapter.findByExecutionId('EXEC-ERR');
  assert(ledger!.entries.length > 0, 'Ledger should have entries before crash');
  const lastEntry = ledger!.entries[ledger!.entries.length - 1];
  assert(lastEntry.entryType as string === 'SYSTEM', 'Last entry on error should be SYSTEM error');

  if (fs.existsSync('/tmp/aios_coord_test.json')) {
    fs.unlinkSync('/tmp/aios_coord_test.json');
  }

  console.log('All ExecutionCoordinator tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
