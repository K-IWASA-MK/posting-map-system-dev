import { WorkerRequest } from '../../../aios/execution/WorkerRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testWorkerRequestStructure() {
  console.log('[Test] WorkerRequest properties starting...');

  const request: WorkerRequest = {
    requestId: "req-123",
    workerId: "worker-1",
    executionId: "exec-456"
  };

  assert(request.requestId === "req-123", "requestId mismatch");
  assert(request.workerId === "worker-1", "workerId mismatch");
  assert(request.executionId === "exec-456", "executionId mismatch");

  console.log('   ✓ WorkerRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-1: WorkerRequest Unit Tests ---');
  await testWorkerRequestStructure();
  console.log('--- All G8-1: WorkerRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
