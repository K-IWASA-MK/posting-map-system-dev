import { RuntimeMetricsResponse } from '../../../aios/execution/RuntimeMetricsResponse';
import { RuntimeMetricsState } from '../../../aios/execution/RuntimeMetricsState';
import { RuntimeMetricsSummary } from '../../../aios/execution/RuntimeMetricsSummary';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRuntimeMetricsResponseStructure() {
  console.log('[Test] RuntimeMetricsResponse properties starting...');

  const metricsState: RuntimeMetricsState = {
    executionId: "exec-123",
    pipelineId: "pipeline-456",
    status: "success"
  };

  const summary: RuntimeMetricsSummary = {
    completedStages: 2,
    totalStages: 2
  };

  const response: RuntimeMetricsResponse = {
    metrics: metricsState,
    summary
  };

  assert(response.metrics.executionId === "exec-123", "executionId mismatch");
  assert(response.summary.completedStages === 2, "completedStages mismatch");

  console.log('   ✓ RuntimeMetricsResponse properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-7: RuntimeMetricsResponse Unit Tests ---');
  await testRuntimeMetricsResponseStructure();
  console.log('--- All G8-7: RuntimeMetricsResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
