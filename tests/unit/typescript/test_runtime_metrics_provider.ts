import { RuntimeMetricsProvider } from '../../../aios/execution/RuntimeMetricsProvider';
import { RuntimeMetricsRequest } from '../../../aios/execution/RuntimeMetricsRequest';
import { RuntimeMetricsResponse } from '../../../aios/execution/RuntimeMetricsResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockRuntimeMetricsProvider implements RuntimeMetricsProvider {
  public createRuntimeMetrics(
    request: RuntimeMetricsRequest
  ): RuntimeMetricsResponse {
    // Input validation boundary
    if (!request) {
      throw new Error("MockRuntimeMetricsProvider: RuntimeMetricsRequest cannot be null or undefined.");
    }
    if (!request.executionResult) {
      throw new Error("MockRuntimeMetricsProvider: executionResult must be provided.");
    }
    if (!request.executionResult.result) {
      throw new Error("MockRuntimeMetricsProvider: result must be provided in executionResult.");
    }
    if (!request.executionResult.result.pipelineId || request.executionResult.result.pipelineId.trim() === "") {
      throw new Error("MockRuntimeMetricsProvider: Invalid or empty pipelineId.");
    }

    // Metrics Aggregation Contract (Metrics Resolution)
    return {
      metrics: {
        executionId: request.executionResult.result.executionId,
        pipelineId: request.executionResult.result.pipelineId,
        status: request.executionResult.result.status
      },
      summary: {
        completedStages: request.executionResult.summary.completedStages,
        totalStages: request.executionResult.summary.totalStages
      }
    };
  }
}

async function testMockRuntimeMetricsProviderNormal() {
  console.log('[Test] MockRuntimeMetricsProvider normal resolution starting...');

  const provider = new MockRuntimeMetricsProvider();
  const request: RuntimeMetricsRequest = {
    executionResult: {
      result: {
        executionId: "exec-111",
        pipelineId: "pipeline-111",
        status: "success"
      },
      summary: {
        completedStages: 2,
        totalStages: 3
      }
    }
  };

  const result = provider.createRuntimeMetrics(request);
  assert(result.metrics.executionId === "exec-111", "Metrics executionId mismatch");
  assert(result.metrics.pipelineId === "pipeline-111", "Metrics pipelineId mismatch");
  assert(result.metrics.status === "success", "Metrics status mismatch");
  assert(result.summary.completedStages === 2, "Summary completedStages mismatch");
  assert(result.summary.totalStages === 3, "Summary totalStages mismatch");

  // Verify Deterministic Metrics Resolution (Contract-03)
  const duplicateResult = provider.createRuntimeMetrics(request);
  assert(result.metrics.executionId === duplicateResult.metrics.executionId, "ExecutionId must be deterministic");
  assert(result.metrics.pipelineId === duplicateResult.metrics.pipelineId, "PipelineId must be deterministic");
  assert(result.metrics.status === duplicateResult.metrics.status, "Status must be deterministic");
  assert(result.summary.completedStages === duplicateResult.summary.completedStages, "CompletedStages must be deterministic");
  assert(result.summary.totalStages === duplicateResult.summary.totalStages, "TotalStages must be deterministic");

  console.log('   ✓ MockRuntimeMetricsProvider normal resolution: PASSED');
}

async function testMockRuntimeMetricsProviderAbnormal() {
  console.log('[Test] MockRuntimeMetricsProvider boundary conditions starting...');

  const provider = new MockRuntimeMetricsProvider();

  // 1. Missing request object
  let threwMissingRequest = false;
  try {
    provider.createRuntimeMetrics(null as any);
  } catch (err: any) {
    threwMissingRequest = true;
    assert(err.message.includes("RuntimeMetricsRequest cannot be null or undefined"), "Error message mismatch");
  }
  assert(threwMissingRequest, "Missing request must throw an error");

  // 2. Missing executionResult
  let threwMissingResult = false;
  try {
    provider.createRuntimeMetrics({ executionResult: null as any });
  } catch (err: any) {
    threwMissingResult = true;
    assert(err.message.includes("executionResult must be provided"), "Error message mismatch");
  }
  assert(threwMissingResult, "Missing executionResult must throw an error");

  // 3. Empty pipelineId
  let threwEmptyPipelineId = false;
  try {
    provider.createRuntimeMetrics({
      executionResult: {
        result: {
          executionId: "exec-111",
          pipelineId: "",
          status: "success"
        },
        summary: {
          completedStages: 1,
          totalStages: 2
        }
      }
    });
  } catch (err: any) {
    threwEmptyPipelineId = true;
    assert(err.message.includes("Invalid or empty pipelineId"), "Error message mismatch");
  }
  assert(threwEmptyPipelineId, "Empty pipelineId must throw an error");

  console.log('   ✓ MockRuntimeMetricsProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-7: RuntimeMetricsProvider Unit Tests ---');
  await testMockRuntimeMetricsProviderNormal();
  await testMockRuntimeMetricsProviderAbnormal();
  console.log('--- All G8-7: RuntimeMetricsProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
