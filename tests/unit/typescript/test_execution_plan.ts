import { ExecutionPlan } from '../../../aios/execution/ExecutionPlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionPlanStructure() {
  console.log('[Test] ExecutionPlan properties starting...');

  const plan: ExecutionPlan = {
    executionId: "exec-123",
    workerId: "worker-b",
    requestId: "req-xyz"
  };

  assert(plan.executionId === "exec-123", "executionId mismatch");
  assert(plan.workerId === "worker-b", "workerId mismatch");
  assert(plan.requestId === "req-xyz", "requestId mismatch");

  console.log('   ✓ ExecutionPlan properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-2: ExecutionPlan Unit Tests ---');
  await testExecutionPlanStructure();
  console.log('--- All G8-2: ExecutionPlan Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
