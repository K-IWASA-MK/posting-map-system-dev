import { ExecutionLifecycleProvider } from '../../../aios/execution/ExecutionLifecycleProvider';
import { ExecutionLifecycleRequest } from '../../../aios/execution/ExecutionLifecycleRequest';
import { ExecutionLifecycleResponse } from '../../../aios/execution/ExecutionLifecycleResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockExecutionLifecycleProvider implements ExecutionLifecycleProvider {
  public createExecutionLifecycle(
    request: ExecutionLifecycleRequest
  ): ExecutionLifecycleResponse {
    // Input validation boundary
    if (!request) {
      throw new Error("MockExecutionLifecycleProvider: ExecutionLifecycleRequest cannot be null or undefined.");
    }
    if (!request.runtimeMetrics) {
      throw new Error("MockExecutionLifecycleProvider: runtimeMetrics must be provided.");
    }
    if (!request.runtimeMetrics.metrics) {
      throw new Error("MockExecutionLifecycleProvider: metrics must be provided in runtimeMetrics.");
    }
    if (!request.runtimeMetrics.metrics.pipelineId || request.runtimeMetrics.metrics.pipelineId.trim() === "") {
      throw new Error("MockExecutionLifecycleProvider: Invalid or empty pipelineId.");
    }

    // Lifecycle State & Transition Contract
    const lifecycleState = request.runtimeMetrics.metrics.status === "success" ? "completed" : "failed";
    const currentStage = "lifecycle-resolved";
    const availableStages = ["initialized", "running", "lifecycle-resolved"];

    return {
      lifecycle: {
        executionId: request.runtimeMetrics.metrics.executionId,
        pipelineId: request.runtimeMetrics.metrics.pipelineId,
        lifecycleState
      },
      stage: {
        currentStage,
        availableStages
      }
    };
  }
}

async function testMockExecutionLifecycleProviderNormal() {
  console.log('[Test] MockExecutionLifecycleProvider normal resolution starting...');

  const provider = new MockExecutionLifecycleProvider();
  const request: ExecutionLifecycleRequest = {
    runtimeMetrics: {
      metrics: {
        executionId: "exec-777",
        pipelineId: "pipeline-777",
        status: "success"
      },
      summary: {
        completedStages: 3,
        totalStages: 3
      }
    }
  };

  const result = provider.createExecutionLifecycle(request);
  assert(result.lifecycle.executionId === "exec-777", "Lifecycle executionId mismatch");
  assert(result.lifecycle.pipelineId === "pipeline-777", "Lifecycle pipelineId mismatch");
  assert(result.lifecycle.lifecycleState === "completed", "Lifecycle lifecycleState mismatch");
  assert(result.stage.currentStage === "lifecycle-resolved", "Stage currentStage mismatch");
  assert(result.stage.availableStages.includes("lifecycle-resolved"), "Stage availableStages missing resolved state");

  // Verify Deterministic Lifecycle Resolution (Contract-03)
  const duplicateResult = provider.createExecutionLifecycle(request);
  assert(result.lifecycle.executionId === duplicateResult.lifecycle.executionId, "ExecutionId must be deterministic");
  assert(result.lifecycle.pipelineId === duplicateResult.lifecycle.pipelineId, "PipelineId must be deterministic");
  assert(result.lifecycle.lifecycleState === duplicateResult.lifecycle.lifecycleState, "LifecycleState must be deterministic");
  assert(result.stage.currentStage === duplicateResult.stage.currentStage, "CurrentStage must be deterministic");

  console.log('   ✓ MockExecutionLifecycleProvider normal resolution: PASSED');
}

async function testMockExecutionLifecycleProviderAbnormal() {
  console.log('[Test] MockExecutionLifecycleProvider boundary conditions starting...');

  const provider = new MockExecutionLifecycleProvider();

  // 1. Missing request object
  let threwMissingRequest = false;
  try {
    provider.createExecutionLifecycle(null as any);
  } catch (err: any) {
    threwMissingRequest = true;
    assert(err.message.includes("ExecutionLifecycleRequest cannot be null or undefined"), "Error message mismatch");
  }
  assert(threwMissingRequest, "Missing request must throw an error");

  // 2. Missing runtimeMetrics
  let threwMissingMetrics = false;
  try {
    provider.createExecutionLifecycle({ runtimeMetrics: null as any });
  } catch (err: any) {
    threwMissingMetrics = true;
    assert(err.message.includes("runtimeMetrics must be provided"), "Error message mismatch");
  }
  assert(threwMissingMetrics, "Missing runtimeMetrics must throw an error");

  // 3. Empty pipelineId
  let threwEmptyPipelineId = false;
  try {
    provider.createExecutionLifecycle({
      runtimeMetrics: {
        metrics: {
          executionId: "exec-777",
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

  console.log('   ✓ MockExecutionLifecycleProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-8: ExecutionLifecycleProvider Unit Tests ---');
  await testMockExecutionLifecycleProviderNormal();
  await testMockExecutionLifecycleProviderAbnormal();
  console.log('--- All G8-8: ExecutionLifecycleProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
