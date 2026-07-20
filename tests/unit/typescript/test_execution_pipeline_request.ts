import { ExecutionPipelineRequest } from '../../../aios/execution/ExecutionPipelineRequest';
import { OrchestrationPlan } from '../../../aios/execution/OrchestrationPlan';
import { ExecutionContextState } from '../../../aios/execution/ExecutionContextState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionPipelineRequestStructure() {
  console.log('[Test] ExecutionPipelineRequest properties starting...');

  const orchestrationPlan: OrchestrationPlan = {
    orchestrationId: "orch-123",
    executionId: "exec-456",
    workerIds: ["worker-1"]
  };

  const context: ExecutionContextState = {
    executionId: "exec-456",
    orchestrationId: "orch-123",
    runtimeId: "runtime-x",
    sessionId: "session-abc"
  };

  const request: ExecutionPipelineRequest = {
    orchestrationPlan,
    context
  };

  assert(request.orchestrationPlan.orchestrationId === "orch-123", "orchestrationPlan mismatch");
  assert(request.context.sessionId === "session-abc", "context mismatch");

  console.log('   ✓ ExecutionPipelineRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-5: ExecutionPipelineRequest Unit Tests ---');
  await testExecutionPipelineRequestStructure();
  console.log('--- All G8-5: ExecutionPipelineRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
