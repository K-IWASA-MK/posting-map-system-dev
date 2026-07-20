import { AgentOrchestrator } from '../../../aios/execution/AgentOrchestrator';
import { OrchestrationRequest } from '../../../aios/execution/OrchestrationRequest';
import { OrchestrationResult } from '../../../aios/execution/OrchestrationResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAgentOrchestrator implements AgentOrchestrator {
  public createOrchestrationPlan(
    request: OrchestrationRequest
  ): OrchestrationResult {
    // Input validation boundary
    if (!request) {
      throw new Error("MockAgentOrchestrator: OrchestrationRequest cannot be null or undefined.");
    }
    if (!request.executionPlan) {
      throw new Error("MockAgentOrchestrator: executionPlan must be provided.");
    }
    if (!request.executionPlan.executionId || request.executionPlan.executionId.trim() === "") {
      throw new Error("MockAgentOrchestrator: Invalid or empty executionId.");
    }

    const orchestrationId = `orch-${request.executionPlan.executionId}`;
    // Deterministic dependency order sequencing (dependency resolution contract)
    const workerIds = [request.executionPlan.workerId];

    return {
      orchestrationPlan: {
        orchestrationId,
        executionId: request.executionPlan.executionId,
        workerIds
      }
    };
  }
}

async function testMockAgentOrchestratorNormal() {
  console.log('[Test] MockAgentOrchestrator plan creation starting...');

  const orchestrator = new MockAgentOrchestrator();
  const request: OrchestrationRequest = {
    executionPlan: {
      executionId: "exec-req-hash-abc",
      workerId: "worker-qa",
      requestId: "req-hash-abc"
    }
  };

  const result = orchestrator.createOrchestrationPlan(request);
  assert(result.orchestrationPlan.orchestrationId === "orch-exec-req-hash-abc", "Plan orchestrationId mismatch");
  assert(result.orchestrationPlan.executionId === "exec-req-hash-abc", "Plan executionId mismatch");
  assert(result.orchestrationPlan.workerIds.length === 1, "Plan workerIds length mismatch");
  assert(result.orchestrationPlan.workerIds[0] === "worker-qa", "Plan workerIds element mismatch");

  // Verify Determinism
  const duplicateResult = orchestrator.createOrchestrationPlan(request);
  assert(result.orchestrationPlan.orchestrationId === duplicateResult.orchestrationPlan.orchestrationId, "OrchestrationId must be deterministic");
  assert(result.orchestrationPlan.executionId === duplicateResult.orchestrationPlan.executionId, "ExecutionId must be deterministic");
  assert(result.orchestrationPlan.workerIds[0] === duplicateResult.orchestrationPlan.workerIds[0], "WorkerIds mapping must be deterministic");

  console.log('   ✓ MockAgentOrchestrator plan creation: PASSED');
}

async function testMockAgentOrchestratorAbnormal() {
  console.log('[Test] MockAgentOrchestrator boundary conditions starting...');

  const orchestrator = new MockAgentOrchestrator();

  // 1. Missing request object
  let threwMissingRequest = false;
  try {
    orchestrator.createOrchestrationPlan(null as any);
  } catch (err: any) {
    threwMissingRequest = true;
    assert(err.message.includes("OrchestrationRequest cannot be null or undefined"), "Error message mismatch");
  }
  assert(threwMissingRequest, "Missing request must throw an error");

  // 2. Missing execution plan
  let threwMissingPlan = false;
  try {
    orchestrator.createOrchestrationPlan({ executionPlan: null as any });
  } catch (err: any) {
    threwMissingPlan = true;
    assert(err.message.includes("executionPlan must be provided"), "Error message mismatch");
  }
  assert(threwMissingPlan, "Missing executionPlan must throw an error");

  // 3. Empty executionId
  let threwEmptyExecutionId = false;
  try {
    orchestrator.createOrchestrationPlan({
      executionPlan: {
        executionId: "",
        workerId: "worker-qa",
        requestId: "req-hash-abc"
      }
    });
  } catch (err: any) {
    threwEmptyExecutionId = true;
    assert(err.message.includes("Invalid or empty executionId"), "Error message mismatch");
  }
  assert(threwEmptyExecutionId, "Empty executionId must throw an error");

  console.log('   ✓ MockAgentOrchestrator boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-3: AgentOrchestrator Unit Tests ---');
  await testMockAgentOrchestratorNormal();
  await testMockAgentOrchestratorAbnormal();
  console.log('--- All G8-3: AgentOrchestrator Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
