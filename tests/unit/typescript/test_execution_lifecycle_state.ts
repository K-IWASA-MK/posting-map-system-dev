import { ExecutionLifecycleState } from '../../../aios/execution/ExecutionLifecycleState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionLifecycleStateStructure() {
  console.log('[Test] ExecutionLifecycleState properties starting...');

  const state: ExecutionLifecycleState = {
    executionId: "exec-123",
    pipelineId: "pipeline-456",
    lifecycleState: "running"
  };

  assert(state.executionId === "exec-123", "executionId mismatch");
  assert(state.pipelineId === "pipeline-456", "pipelineId mismatch");
  assert(state.lifecycleState === "running", "lifecycleState mismatch");

  console.log('   ✓ ExecutionLifecycleState properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-8: ExecutionLifecycleState Unit Tests ---');
  await testExecutionLifecycleStateStructure();
  console.log('--- All G8-8: ExecutionLifecycleState Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
