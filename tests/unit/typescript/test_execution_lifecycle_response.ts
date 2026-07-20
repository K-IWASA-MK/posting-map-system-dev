import { ExecutionLifecycleResponse } from '../../../aios/execution/ExecutionLifecycleResponse';
import { ExecutionLifecycleState } from '../../../aios/execution/ExecutionLifecycleState';
import { ExecutionLifecycleStage } from '../../../aios/execution/ExecutionLifecycleStage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionLifecycleResponseStructure() {
  console.log('[Test] ExecutionLifecycleResponse properties starting...');

  const lifecycleState: ExecutionLifecycleState = {
    executionId: "exec-123",
    pipelineId: "pipeline-456",
    lifecycleState: "running"
  };

  const stage: ExecutionLifecycleStage = {
    currentStage: "execution-planning",
    availableStages: ["execution-planning", "running"]
  };

  const response: ExecutionLifecycleResponse = {
    lifecycle: lifecycleState,
    stage
  };

  assert(response.lifecycle.executionId === "exec-123", "executionId mismatch");
  assert(response.stage.currentStage === "execution-planning", "currentStage mismatch");

  console.log('   ✓ ExecutionLifecycleResponse properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-8: ExecutionLifecycleResponse Unit Tests ---');
  await testExecutionLifecycleResponseStructure();
  console.log('--- All G8-8: ExecutionLifecycleResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
