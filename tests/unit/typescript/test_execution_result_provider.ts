import { ExecutionResultProvider } from '../../../aios/execution/ExecutionResultProvider';
import { ExecutionResultRequest } from '../../../aios/execution/ExecutionResultRequest';
import { ExecutionResultResponse } from '../../../aios/execution/ExecutionResultResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockExecutionResultProvider implements ExecutionResultProvider {
  public createExecutionResult(
    request: ExecutionResultRequest
  ): ExecutionResultResponse {
    // Input validation boundary
    if (!request) {
      throw new Error("MockExecutionResultProvider: ExecutionResultRequest cannot be null or undefined.");
    }
    if (!request.pipelinePlan) {
      throw new Error("MockExecutionResultProvider: pipelinePlan must be provided.");
    }
    if (!request.pipelinePlan.pipelineId || request.pipelinePlan.pipelineId.trim() === "") {
      throw new Error("MockExecutionResultProvider: Invalid or empty pipelineId.");
    }

    // Aggregation Contract (Result Resolution)
    const status = "success";
    const completedStages = request.pipelinePlan.stages.length;
    const totalStages = request.pipelinePlan.stages.length;

    return {
      result: {
        executionId: request.pipelinePlan.executionId,
        pipelineId: request.pipelinePlan.pipelineId,
        status
      },
      summary: {
        completedStages,
        totalStages
      }
    };
  }
}

async function testMockExecutionResultProviderNormal() {
  console.log('[Test] MockExecutionResultProvider normal resolution starting...');

  const provider = new MockExecutionResultProvider();
  const request: ExecutionResultRequest = {
    pipelinePlan: {
      pipelineId: "pipeline-orch-123",
      executionId: "exec-456",
      stages: ["stage-worker-auth", "stage-worker-log"]
    }
  };

  const result = provider.createExecutionResult(request);
  assert(result.result.executionId === "exec-456", "Result executionId mismatch");
  assert(result.result.pipelineId === "pipeline-orch-123", "Result pipelineId mismatch");
  assert(result.result.status === "success", "Result status mismatch");
  assert(result.summary.completedStages === 2, "Summary completedStages mismatch");
  assert(result.summary.totalStages === 2, "Summary totalStages mismatch");

  // Verify Deterministic Result Resolution (Contract-03)
  const duplicateResult = provider.createExecutionResult(request);
  assert(result.result.executionId === duplicateResult.result.executionId, "ExecutionId must be deterministic");
  assert(result.result.pipelineId === duplicateResult.result.pipelineId, "PipelineId must be deterministic");
  assert(result.result.status === duplicateResult.result.status, "Status must be deterministic");
  assert(result.summary.completedStages === duplicateResult.summary.completedStages, "CompletedStages must be deterministic");
  assert(result.summary.totalStages === duplicateResult.summary.totalStages, "TotalStages must be deterministic");

  console.log('   ✓ MockExecutionResultProvider normal resolution: PASSED');
}

async function testMockExecutionResultProviderAbnormal() {
  console.log('[Test] MockExecutionResultProvider boundary conditions starting...');

  const provider = new MockExecutionResultProvider();

  // 1. Missing request object
  let threwMissingRequest = false;
  try {
    provider.createExecutionResult(null as any);
  } catch (err: any) {
    threwMissingRequest = true;
    assert(err.message.includes("ExecutionResultRequest cannot be null or undefined"), "Error message mismatch");
  }
  assert(threwMissingRequest, "Missing request must throw an error");

  // 2. Missing pipelinePlan
  let threwMissingPlan = false;
  try {
    provider.createExecutionResult({ pipelinePlan: null as any });
  } catch (err: any) {
    threwMissingPlan = true;
    assert(err.message.includes("pipelinePlan must be provided"), "Error message mismatch");
  }
  assert(threwMissingPlan, "Missing pipelinePlan must throw an error");

  // 3. Empty pipelineId
  let threwEmptyPipelineId = false;
  try {
    provider.createExecutionResult({
      pipelinePlan: {
        pipelineId: "",
        executionId: "exec-456",
        stages: ["stage-1"]
      }
    });
  } catch (err: any) {
    threwEmptyPipelineId = true;
    assert(err.message.includes("Invalid or empty pipelineId"), "Error message mismatch");
  }
  assert(threwEmptyPipelineId, "Empty pipelineId must throw an error");

  console.log('   ✓ MockExecutionResultProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-6: ExecutionResultProvider Unit Tests ---');
  await testMockExecutionResultProviderNormal();
  await testMockExecutionResultProviderAbnormal();
  console.log('--- All G8-6: ExecutionResultProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
