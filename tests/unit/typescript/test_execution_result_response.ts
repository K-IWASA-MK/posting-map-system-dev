import { ExecutionResultResponse } from '../../../aios/execution/ExecutionResultResponse';
import { ExecutionResultState } from '../../../aios/execution/ExecutionResultState';
import { ExecutionResultSummary } from '../../../aios/execution/ExecutionResultSummary';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionResultResponseStructure() {
  console.log('[Test] ExecutionResultResponse properties starting...');

  const resultState: ExecutionResultState = {
    executionId: "exec-123",
    pipelineId: "pipeline-456",
    status: "success"
  };

  const summary: ExecutionResultSummary = {
    completedStages: 2,
    totalStages: 2
  };

  const response: ExecutionResultResponse = {
    result: resultState,
    summary
  };

  assert(response.result.executionId === "exec-123", "executionId mismatch");
  assert(response.summary.completedStages === 2, "completedStages mismatch");

  console.log('   ✓ ExecutionResultResponse properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-6: ExecutionResultResponse Unit Tests ---');
  await testExecutionResultResponseStructure();
  console.log('--- All G8-6: ExecutionResultResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
