import { DevelopmentRuleEngine } from '../../../../../../sdk/core/aios/engine/DevelopmentRuleEngine';
import { PluginRegistry } from '../../../../../../sdk/core/aios/engine/PluginRegistry';
import { DevelopmentContextBuilder } from '../../../../../../sdk/core/aios/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../../sdk/core/aios/context/DevelopmentContextType';
import { JsonExecutionLedgerAdapter } from '../../../../../../sdk/core/aios/ledger/JsonExecutionLedgerAdapter';
import { ExecutionRecorder } from '../../../../../../sdk/core/aios/ledger/ExecutionRecorder';
import { ExecutionLedgerEntryType } from '../../../../../../sdk/core/aios/ledger/ExecutionLedgerEntryType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running DevelopmentRuleEngine_Ledger Integration test...');
  
  // Setup phase
  const testPath = `/tmp/aios_ledger_${Date.now()}.json`;
  const adapter = new JsonExecutionLedgerAdapter(testPath);
  const recorder = new ExecutionRecorder(adapter, 'EXEC-INT-1', 'CORR-INT-1');

  await recorder.record(ExecutionLedgerEntryType.SYSTEM, { action: 'AIOS Booting' });

  // Create Context
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('posting-map')
    .build();
    
  await recorder.record(ExecutionLedgerEntryType.CONTEXT, { contextId: context.contextId });

  // Engine Execution
  const registry = new PluginRegistry();
  const engine = new DevelopmentRuleEngine(registry);
  
  // We simulate the internal events that would be emitted by the Orchestrator/Engine
  // 1. Validation
  await recorder.record(ExecutionLedgerEntryType.VALIDATION, { pipelineId: 'PL-1', status: 'PASS' });
  
  // 2. Review
  await recorder.record(ExecutionLedgerEntryType.REVIEW, { reviewerId: 'Gemini', confidence: 0.99 });
  
  // 3. Governance
  await recorder.record(ExecutionLedgerEntryType.GOVERNANCE, { decisionId: 'DEC-1', action: 'PROCEED' });

  // Ensure flush is called
  await recorder.flush();

  const ledger = await adapter.findByExecutionId('EXEC-INT-1');
  
  assert(ledger !== null, 'Ledger should be created');
  assert(ledger!.entries.length === 5, 'Should have 5 events recorded in sequence');
  assert(ledger!.entries[4].entryType === ExecutionLedgerEntryType.GOVERNANCE, 'Last event should be GOVERNANCE');
  assert(ledger!.entries[4].parentEntryId === ledger!.entries[3].entryId, 'Tree sequence should be linked');

  console.log('All DevelopmentRuleEngine_Ledger Integration tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
