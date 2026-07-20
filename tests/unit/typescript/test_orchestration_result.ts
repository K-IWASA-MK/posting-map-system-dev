import { OrchestrationResult } from '../../../aios/execution/OrchestrationResult';
import { OrchestrationPlan } from '../../../aios/execution/OrchestrationPlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testOrchestrationResultStructure() {
  console.log('[Test] OrchestrationResult properties starting...');

  const orchestrationPlan: OrchestrationPlan = {
    orchestrationId: "orch-123",
    executionId: "exec-456",
    workerIds: ["worker-1", "worker-2"]
  };

  const result: OrchestrationResult = {
    orchestrationPlan
  };

  assert(result.orchestrationPlan.orchestrationId === "orch-123", "orchestrationId mismatch");
  assert(result.orchestrationPlan.executionId === "exec-456", "executionId mismatch");

  console.log('   ✓ OrchestrationResult properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-3: OrchestrationResult Unit Tests ---');
  await testOrchestrationResultStructure();
  console.log('--- All G8-3: OrchestrationResult Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
