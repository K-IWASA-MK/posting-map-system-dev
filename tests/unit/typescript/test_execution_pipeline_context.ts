import { ExecutionPipelineContext } from '../../../aios/execution/ExecutionPipelineContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionPipelineContextStructure() {
  console.log('[Test] ExecutionPipelineContext properties starting...');

  const context: ExecutionPipelineContext = {
    pipelineId: "pipeline-123",
    executionId: "exec-456",
    orchestrationId: "orch-789"
  };

  assert(context.pipelineId === "pipeline-123", "pipelineId mismatch");
  assert(context.executionId === "exec-456", "executionId mismatch");
  assert(context.orchestrationId === "orch-789", "orchestrationId mismatch");

  console.log('   ✓ ExecutionPipelineContext properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-5: ExecutionPipelineContext Unit Tests ---');
  await testExecutionPipelineContextStructure();
  console.log('--- All G8-5: ExecutionPipelineContext Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
