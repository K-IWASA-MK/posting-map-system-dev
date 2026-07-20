import { ExecutionContextProvider } from '../../../aios/execution/ExecutionContextProvider';
import { ExecutionContextRequest } from '../../../aios/execution/ExecutionContextRequest';
import { ExecutionContextResult } from '../../../aios/execution/ExecutionContextResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockExecutionContextProvider implements ExecutionContextProvider {
  public createExecutionContext(
    request: ExecutionContextRequest
  ): ExecutionContextResult {
    // Input validation boundary
    if (!request) {
      throw new Error("MockExecutionContextProvider: ExecutionContextRequest cannot be null or undefined.");
    }
    if (!request.orchestrationPlan) {
      throw new Error("MockExecutionContextProvider: orchestrationPlan must be provided.");
    }
    if (!request.orchestrationPlan.orchestrationId || request.orchestrationPlan.orchestrationId.trim() === "") {
      throw new Error("MockExecutionContextProvider: Invalid or empty orchestrationId.");
    }

    // Context Resolution Contract (Resolve Execution Context)
    const runtimeId = "runtime-core";
    const sessionId = `session-${request.orchestrationPlan.executionId}`;

    return {
      context: {
        executionId: request.orchestrationPlan.executionId,
        orchestrationId: request.orchestrationPlan.orchestrationId,
        runtimeId,
        sessionId
      }
    };
  }
}

async function testMockExecutionContextProviderNormal() {
  console.log('[Test] MockExecutionContextProvider normal resolution starting...');

  const provider = new MockExecutionContextProvider();
  const request: ExecutionContextRequest = {
    orchestrationPlan: {
      orchestrationId: "orch-exec-111",
      executionId: "exec-111",
      workerIds: ["worker-arch"]
    }
  };

  const result = provider.createExecutionContext(request);
  assert(result.context.executionId === "exec-111", "Context executionId mismatch");
  assert(result.context.orchestrationId === "orch-exec-111", "Context orchestrationId mismatch");
  assert(result.context.runtimeId === "runtime-core", "Context runtimeId mismatch");
  assert(result.context.sessionId === "session-exec-111", "Context sessionId mismatch");

  // Verify Deterministic Context Resolution (Contract-03)
  const duplicateResult = provider.createExecutionContext(request);
  assert(result.context.executionId === duplicateResult.context.executionId, "ExecutionId must be deterministic");
  assert(result.context.orchestrationId === duplicateResult.context.orchestrationId, "OrchestrationId must be deterministic");
  assert(result.context.runtimeId === duplicateResult.context.runtimeId, "RuntimeId must be deterministic");
  assert(result.context.sessionId === duplicateResult.context.sessionId, "SessionId must be deterministic");

  console.log('   ✓ MockExecutionContextProvider normal resolution: PASSED');
}

async function testMockExecutionContextProviderAbnormal() {
  console.log('[Test] MockExecutionContextProvider boundary conditions starting...');

  const provider = new MockExecutionContextProvider();

  // 1. Missing request object
  let threwMissingRequest = false;
  try {
    provider.createExecutionContext(null as any);
  } catch (err: any) {
    threwMissingRequest = true;
    assert(err.message.includes("ExecutionContextRequest cannot be null or undefined"), "Error message mismatch");
  }
  assert(threwMissingRequest, "Missing request must throw an error");

  // 2. Missing orchestrationPlan
  let threwMissingPlan = false;
  try {
    provider.createExecutionContext({ orchestrationPlan: null as any });
  } catch (err: any) {
    threwMissingPlan = true;
    assert(err.message.includes("orchestrationPlan must be provided"), "Error message mismatch");
  }
  assert(threwMissingPlan, "Missing orchestrationPlan must throw an error");

  // 3. Empty orchestrationId
  let threwEmptyOrchId = false;
  try {
    provider.createExecutionContext({
      orchestrationPlan: {
        orchestrationId: "",
        executionId: "exec-111",
        workerIds: ["worker-arch"]
      }
    });
  } catch (err: any) {
    threwEmptyOrchId = true;
    assert(err.message.includes("Invalid or empty orchestrationId"), "Error message mismatch");
  }
  assert(threwEmptyOrchId, "Empty orchestrationId must throw an error");

  console.log('   ✓ MockExecutionContextProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-4: ExecutionContextProvider Unit Tests ---');
  await testMockExecutionContextProviderNormal();
  await testMockExecutionContextProviderAbnormal();
  console.log('--- All G8-4: ExecutionContextProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
