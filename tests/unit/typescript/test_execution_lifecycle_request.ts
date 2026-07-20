import { ExecutionLifecycleRequest } from '../../../aios/execution/ExecutionLifecycleRequest';
import { RuntimeMetricsResponse } from '../../../aios/execution/RuntimeMetricsResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionLifecycleRequestStructure() {
  console.log('[Test] ExecutionLifecycleRequest properties starting...');

  const runtimeMetrics: RuntimeMetricsResponse = {
    metrics: {
      executionId: "exec-123",
      pipelineId: "pipeline-456",
      status: "success"
    },
    summary: {
      completedStages: 2,
      totalStages: 3
    }
  };

  const request: ExecutionLifecycleRequest = {
    runtimeMetrics
  };

  assert(request.runtimeMetrics.metrics.executionId === "exec-123", "executionId mismatch");
  assert(request.runtimeMetrics.summary.completedStages === 2, "completedStages mismatch");

  console.log('   ✓ ExecutionLifecycleRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-8: ExecutionLifecycleRequest Unit Tests ---');
  await testExecutionLifecycleRequestStructure();
  console.log('--- All G8-8: ExecutionLifecycleRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
