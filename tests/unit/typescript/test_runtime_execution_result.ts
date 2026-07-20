import { RuntimeExecutionResult } from '../../../aios/execution/RuntimeExecutionResult';
import { ExecutionPlan } from '../../../aios/execution/ExecutionPlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRuntimeExecutionResultStructure() {
  console.log('[Test] RuntimeExecutionResult properties starting...');

  const executionPlan: ExecutionPlan = {
    executionId: "exec-123",
    workerId: "worker-b",
    requestId: "req-xyz"
  };

  const result: RuntimeExecutionResult = {
    executionPlan
  };

  assert(result.executionPlan.executionId === "exec-123", "executionId mismatch");
  assert(result.executionPlan.workerId === "worker-b", "workerId mismatch");

  console.log('   ✓ RuntimeExecutionResult properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-2: RuntimeExecutionResult Unit Tests ---');
  await testRuntimeExecutionResultStructure();
  console.log('--- All G8-2: RuntimeExecutionResult Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
