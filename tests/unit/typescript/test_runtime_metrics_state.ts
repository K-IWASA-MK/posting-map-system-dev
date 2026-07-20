import { RuntimeMetricsState } from '../../../aios/execution/RuntimeMetricsState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRuntimeMetricsStateStructure() {
  console.log('[Test] RuntimeMetricsState properties starting...');

  const state: RuntimeMetricsState = {
    executionId: "exec-123",
    pipelineId: "pipeline-456",
    status: "success"
  };

  assert(state.executionId === "exec-123", "executionId mismatch");
  assert(state.pipelineId === "pipeline-456", "pipelineId mismatch");
  assert(state.status === "success", "status mismatch");

  console.log('   ✓ RuntimeMetricsState properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-7: RuntimeMetricsState Unit Tests ---');
  await testRuntimeMetricsStateStructure();
  console.log('--- All G8-7: RuntimeMetricsState Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
