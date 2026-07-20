import { ExecutionResultState } from '../../../aios/execution/ExecutionResultState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionResultStateStructure() {
  console.log('[Test] ExecutionResultState properties starting...');

  const state: ExecutionResultState = {
    executionId: "exec-123",
    pipelineId: "pipeline-456",
    status: "success"
  };

  assert(state.executionId === "exec-123", "executionId mismatch");
  assert(state.pipelineId === "pipeline-456", "pipelineId mismatch");
  assert(state.status === "success", "status mismatch");

  console.log('   ✓ ExecutionResultState properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-6: ExecutionResultState Unit Tests ---');
  await testExecutionResultStateStructure();
  console.log('--- All G8-6: ExecutionResultState Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
