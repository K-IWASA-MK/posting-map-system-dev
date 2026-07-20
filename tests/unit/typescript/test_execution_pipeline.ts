import { ExecutionPipeline } from '../../../aios/execution/ExecutionPipeline';
import { ExecutionPipelineRequest } from '../../../aios/execution/ExecutionPipelineRequest';
import { ExecutionPipelineResult } from '../../../aios/execution/ExecutionPipelineResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockExecutionPipeline implements ExecutionPipeline {
  public createPipelinePlan(
    request: ExecutionPipelineRequest
  ): ExecutionPipelineResult {
    // Input validation boundary
    if (!request) {
      throw new Error("MockExecutionPipeline: ExecutionPipelineRequest cannot be null or undefined.");
    }
    if (!request.orchestrationPlan) {
      throw new Error("MockExecutionPipeline: orchestrationPlan must be provided.");
    }
    if (!request.context) {
      throw new Error("MockExecutionPipeline: context must be provided.");
    }
    if (request.orchestrationPlan.orchestrationId !== request.context.orchestrationId) {
      throw new Error("MockExecutionPipeline: OrchestrationId mismatch between plan and context.");
    }
    if (request.orchestrationPlan.executionId !== request.context.executionId) {
      throw new Error("MockExecutionPipeline: ExecutionId mismatch between plan and context.");
    }

    const pipelineId = `pipeline-${request.orchestrationPlan.orchestrationId}`;
    
    // Deterministic Pipeline Resolution (Contract-03)
    // ExecutionPipeline resolves stage sequence names
    const stages = request.orchestrationPlan.workerIds.map(wId => `stage-${wId}`);

    return {
      pipelinePlan: {
        pipelineId,
        executionId: request.orchestrationPlan.executionId,
        stages
      }
    };
  }
}

async function testMockExecutionPipelineNormal() {
  console.log('[Test] MockExecutionPipeline normal resolution starting...');

  const pipeline = new MockExecutionPipeline();
  const request: ExecutionPipelineRequest = {
    orchestrationPlan: {
      orchestrationId: "orch-123",
      executionId: "exec-456",
      workerIds: ["worker-auth", "worker-log"]
    },
    context: {
      executionId: "exec-456",
      orchestrationId: "orch-123",
      runtimeId: "runtime-core",
      sessionId: "session-abc"
    }
  };

  const result = pipeline.createPipelinePlan(request);
  assert(result.pipelinePlan.pipelineId === "pipeline-orch-123", "PipelineId mismatch");
  assert(result.pipelinePlan.executionId === "exec-456", "ExecutionId mismatch");
  assert(result.pipelinePlan.stages.length === 2, "Stages length mismatch");
  assert(result.pipelinePlan.stages[0] === "stage-worker-auth", "Stages index 0 mismatch");
  assert(result.pipelinePlan.stages[1] === "stage-worker-log", "Stages index 1 mismatch");

  // Verify Deterministic Pipeline Resolution (Contract-03)
  const duplicateResult = pipeline.createPipelinePlan(request);
  assert(result.pipelinePlan.pipelineId === duplicateResult.pipelinePlan.pipelineId, "PipelineId must be deterministic");
  assert(result.pipelinePlan.stages[0] === duplicateResult.pipelinePlan.stages[0], "Stages sequence must be deterministic");

  console.log('   ✓ MockExecutionPipeline normal resolution: PASSED');
}

async function testMockExecutionPipelineAbnormal() {
  console.log('[Test] MockExecutionPipeline boundary conditions starting...');

  const pipeline = new MockExecutionPipeline();

  // 1. Missing request object
  let threwMissingRequest = false;
  try {
    pipeline.createPipelinePlan(null as any);
  } catch (err: any) {
    threwMissingRequest = true;
    assert(err.message.includes("ExecutionPipelineRequest cannot be null or undefined"), "Error message mismatch");
  }
  assert(threwMissingRequest, "Missing request must throw an error");

  // 2. Missing orchestrationPlan
  let threwMissingPlan = false;
  try {
    pipeline.createPipelinePlan({
      orchestrationPlan: null as any,
      context: {
        executionId: "exec-456",
        orchestrationId: "orch-123",
        runtimeId: "runtime-core",
        sessionId: "session-abc"
      }
    });
  } catch (err: any) {
    threwMissingPlan = true;
    assert(err.message.includes("orchestrationPlan must be provided"), "Error message mismatch");
  }
  assert(threwMissingPlan, "Missing orchestrationPlan must throw an error");

  // 3. OrchestrationId mismatch
  let threwIdMismatch = false;
  try {
    pipeline.createPipelinePlan({
      orchestrationPlan: {
        orchestrationId: "orch-123",
        executionId: "exec-456",
        workerIds: ["worker-1"]
      },
      context: {
        executionId: "exec-456",
        orchestrationId: "orch-mismatch",
        runtimeId: "runtime-core",
        sessionId: "session-abc"
      }
    });
  } catch (err: any) {
    threwIdMismatch = true;
    assert(err.message.includes("OrchestrationId mismatch between plan and context"), "Error message mismatch");
  }
  assert(threwIdMismatch, "ID mismatch must throw an error");

  console.log('   ✓ MockExecutionPipeline boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-5: ExecutionPipeline Unit Tests ---');
  await testMockExecutionPipelineNormal();
  await testMockExecutionPipelineAbnormal();
  console.log('--- All G8-5: ExecutionPipeline Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
