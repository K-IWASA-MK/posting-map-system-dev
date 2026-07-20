import { ExecutionContextRequest } from '../../../aios/execution/ExecutionContextRequest';
import { OrchestrationPlan } from '../../../aios/execution/OrchestrationPlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionContextRequestStructure() {
  console.log('[Test] ExecutionContextRequest properties starting...');

  const orchestrationPlan: OrchestrationPlan = {
    orchestrationId: "orch-123",
    executionId: "exec-456",
    workerIds: ["worker-1"]
  };

  const request: ExecutionContextRequest = {
    orchestrationPlan
  };

  assert(request.orchestrationPlan.orchestrationId === "orch-123", "orchestrationId mismatch");
  assert(request.orchestrationPlan.executionId === "exec-456", "executionId mismatch");

  console.log('   ✓ ExecutionContextRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-4: ExecutionContextRequest Unit Tests ---');
  await testExecutionContextRequestStructure();
  console.log('--- All G8-4: ExecutionContextRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
