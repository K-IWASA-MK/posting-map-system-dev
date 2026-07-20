import { OrchestrationRequest } from '../../../aios/execution/OrchestrationRequest';
import { ExecutionPlan } from '../../../aios/execution/ExecutionPlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testOrchestrationRequestStructure() {
  console.log('[Test] OrchestrationRequest properties starting...');

  const executionPlan: ExecutionPlan = {
    executionId: "exec-456",
    workerId: "worker-1",
    requestId: "req-789"
  };

  const request: OrchestrationRequest = {
    executionPlan
  };

  assert(request.executionPlan.executionId === "exec-456", "executionId mismatch");
  assert(request.executionPlan.workerId === "worker-1", "workerId mismatch");

  console.log('   ✓ OrchestrationRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-3: OrchestrationRequest Unit Tests ---');
  await testOrchestrationRequestStructure();
  console.log('--- All G8-3: OrchestrationRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
