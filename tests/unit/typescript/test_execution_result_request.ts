import { ExecutionResultRequest } from '../../../aios/execution/ExecutionResultRequest';
import { ExecutionPipelinePlan } from '../../../aios/execution/ExecutionPipelinePlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionResultRequestStructure() {
  console.log('[Test] ExecutionResultRequest properties starting...');

  const pipelinePlan: ExecutionPipelinePlan = {
    pipelineId: "pipeline-123",
    executionId: "exec-456",
    stages: ["stage-1"]
  };

  const request: ExecutionResultRequest = {
    pipelinePlan
  };

  assert(request.pipelinePlan.pipelineId === "pipeline-123", "pipelineId mismatch");
  assert(request.pipelinePlan.executionId === "exec-456", "executionId mismatch");

  console.log('   ✓ ExecutionResultRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-6: ExecutionResultRequest Unit Tests ---');
  await testExecutionResultRequestStructure();
  console.log('--- All G8-6: ExecutionResultRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
