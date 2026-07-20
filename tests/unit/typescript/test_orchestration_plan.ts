import { OrchestrationPlan } from '../../../aios/execution/OrchestrationPlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testOrchestrationPlanStructure() {
  console.log('[Test] OrchestrationPlan properties starting...');

  const plan: OrchestrationPlan = {
    orchestrationId: "orch-123",
    executionId: "exec-456",
    workerIds: ["worker-1", "worker-2"]
  };

  assert(plan.orchestrationId === "orch-123", "orchestrationId mismatch");
  assert(plan.executionId === "exec-456", "executionId mismatch");
  assert(plan.workerIds.length === 2, "workerIds length mismatch");
  assert(plan.workerIds[0] === "worker-1", "workerId index 0 mismatch");
  assert(plan.workerIds[1] === "worker-2", "workerId index 1 mismatch");

  console.log('   ✓ OrchestrationPlan properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-3: OrchestrationPlan Unit Tests ---');
  await testOrchestrationPlanStructure();
  console.log('--- All G8-3: OrchestrationPlan Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
