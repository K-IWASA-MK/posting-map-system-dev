import { ExecutionWorker } from '../../../aios/execution/ExecutionWorker';
import { WorkerRequest } from '../../../aios/execution/WorkerRequest';
import { WorkerResult } from '../../../aios/execution/WorkerResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockExecutionWorker implements ExecutionWorker {
  public execute(request: WorkerRequest): WorkerResult {
    if (!request.requestId || request.requestId.trim() === "") {
      throw new Error("MockExecutionWorker: Invalid requestId");
    }
    return {
      requestId: request.requestId,
      completed: true
    };
  }
}

async function testMockExecutionWorkerContract() {
  console.log('[Test] MockExecutionWorker execute contract starting...');

  const worker = new MockExecutionWorker();
  const request: WorkerRequest = {
    requestId: "req-test-1",
    workerId: "worker-arch",
    executionId: "exec-999"
  };

  const result = worker.execute(request);
  assert(result.requestId === "req-test-1", "Result requestId mismatch");
  assert(result.completed === true, "Result completed mismatch");

  // Verify Determinism: same input returns same output values
  const duplicateResult = worker.execute(request);
  assert(result.requestId === duplicateResult.requestId, "Result requestId must be deterministic");
  assert(result.completed === duplicateResult.completed, "Result status must be deterministic");

  console.log('   ✓ MockExecutionWorker execute contract: PASSED');
}

async function testMockExecutionWorkerAbnormal() {
  console.log('[Test] MockExecutionWorker contract boundaries starting...');

  const worker = new MockExecutionWorker();

  let threwEmptyId = false;
  try {
    worker.execute({
      requestId: "",
      workerId: "worker-arch",
      executionId: "exec-999"
    });
  } catch (err: any) {
    threwEmptyId = true;
    assert(err.message.includes("Invalid requestId"), "Error message mismatch");
  }
  assert(threwEmptyId, "Empty requestId must throw an error");

  console.log('   ✓ MockExecutionWorker contract boundaries: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-1: ExecutionWorker Unit Tests ---');
  await testMockExecutionWorkerContract();
  await testMockExecutionWorkerAbnormal();
  console.log('--- All G8-1: ExecutionWorker Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
