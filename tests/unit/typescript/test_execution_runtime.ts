import { ExecutionRuntime } from '../../../aios/execution/ExecutionRuntime';
import { RuntimeExecutionRequest } from '../../../aios/execution/RuntimeExecutionRequest';
import { RuntimeExecutionResult } from '../../../aios/execution/RuntimeExecutionResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockExecutionRuntime implements ExecutionRuntime {
  public createExecutionPlan(
    request: RuntimeExecutionRequest
  ): RuntimeExecutionResult {
    // Input Validation Contract (Validation Contract)
    if (!request) {
      throw new Error("MockExecutionRuntime: RuntimeExecutionRequest cannot be null or undefined.");
    }
    if (!request.schedule) {
      throw new Error("MockExecutionRuntime: schedule must be provided.");
    }
    if (!request.schedule.requestId || request.schedule.requestId.trim() === "") {
      throw new Error("MockExecutionRuntime: Invalid or empty requestId.");
    }

    // Determine target worker deterministically based on schedule status
    const workerId = "worker-default";
    const executionId = `exec-${request.schedule.requestId}`;

    return {
      executionPlan: {
        executionId,
        workerId,
        requestId: request.schedule.requestId
      }
    };
  }
}

async function testMockExecutionRuntimeNormal() {
  console.log('[Test] MockExecutionRuntime plan creation starting...');

  const runtime = new MockExecutionRuntime();
  const request: RuntimeExecutionRequest = {
    schedule: {
      requestId: "req-msg-hash-xyz",
      scheduled: true,
      retryPolicyId: "RETRY-POLICY-DEFAULT",
      throttlePolicyId: "THROTTLE-POLICY-DEFAULT"
    }
  };

  const result = runtime.createExecutionPlan(request);
  assert(result.executionPlan.requestId === "req-msg-hash-xyz", "Plan requestId mismatch");
  assert(result.executionPlan.workerId === "worker-default", "Plan workerId mismatch");
  assert(result.executionPlan.executionId === "exec-req-msg-hash-xyz", "Plan executionId mismatch");

  // Verify Deterministic Planning Contract (Contract-03)
  const duplicateResult = runtime.createExecutionPlan(request);
  assert(result.executionPlan.requestId === duplicateResult.executionPlan.requestId, "Plan requestId must be deterministic");
  assert(result.executionPlan.workerId === duplicateResult.executionPlan.workerId, "Plan workerId must be deterministic");
  assert(result.executionPlan.executionId === duplicateResult.executionPlan.executionId, "Plan executionId must be deterministic");

  console.log('   ✓ MockExecutionRuntime plan creation: PASSED');
}

async function testMockExecutionRuntimeAbnormal() {
  console.log('[Test] MockExecutionRuntime boundary conditions starting...');

  const runtime = new MockExecutionRuntime();

  // 1. Missing request object
  let threwMissingRequest = false;
  try {
    runtime.createExecutionPlan(null as any);
  } catch (err: any) {
    threwMissingRequest = true;
    assert(err.message.includes("RuntimeExecutionRequest cannot be null or undefined"), "Error message mismatch");
  }
  assert(threwMissingRequest, "Missing request must throw an error");

  // 2. Missing schedule
  let threwMissingSchedule = false;
  try {
    runtime.createExecutionPlan({ schedule: null as any });
  } catch (err: any) {
    threwMissingSchedule = true;
    assert(err.message.includes("schedule must be provided"), "Error message mismatch");
  }
  assert(threwMissingSchedule, "Missing schedule must throw an error");

  // 3. Empty requestId
  let threwEmptyRequestId = false;
  try {
    runtime.createExecutionPlan({
      schedule: {
        requestId: "",
        scheduled: true,
        retryPolicyId: "RETRY-POLICY-DEFAULT",
        throttlePolicyId: "THROTTLE-POLICY-DEFAULT"
      }
    });
  } catch (err: any) {
    threwEmptyRequestId = true;
    assert(err.message.includes("Invalid or empty requestId"), "Error message mismatch");
  }
  assert(threwEmptyRequestId, "Empty requestId must throw an error");

  console.log('   ✓ MockExecutionRuntime boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-2: ExecutionRuntime Unit Tests ---');
  await testMockExecutionRuntimeNormal();
  await testMockExecutionRuntimeAbnormal();
  console.log('--- All G8-2: ExecutionRuntime Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
