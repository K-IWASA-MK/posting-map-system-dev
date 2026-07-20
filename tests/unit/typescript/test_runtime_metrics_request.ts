import { RuntimeMetricsRequest } from '../../../aios/execution/RuntimeMetricsRequest';
import { ExecutionResultResponse } from '../../../aios/execution/ExecutionResultResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRuntimeMetricsRequestStructure() {
  console.log('[Test] RuntimeMetricsRequest properties starting...');

  const executionResult: ExecutionResultResponse = {
    result: {
      executionId: "exec-123",
      pipelineId: "pipeline-456",
      status: "success"
    },
    summary: {
      completedStages: 2,
      totalStages: 3
    }
  };

  const request: RuntimeMetricsRequest = {
    executionResult
  };

  assert(request.executionResult.result.executionId === "exec-123", "executionId mismatch");
  assert(request.executionResult.summary.completedStages === 2, "completedStages mismatch");

  console.log('   ✓ RuntimeMetricsRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-7: RuntimeMetricsRequest Unit Tests ---');
  await testRuntimeMetricsRequestStructure();
  console.log('--- All G8-7: RuntimeMetricsRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
