import { WorkerResult } from '../../../aios/execution/WorkerResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testWorkerResultStructure() {
  console.log('[Test] WorkerResult properties starting...');

  const result: WorkerResult = {
    requestId: "req-123",
    completed: true
  };

  assert(result.requestId === "req-123", "requestId mismatch");
  assert(result.completed === true, "completed mismatch");

  console.log('   ✓ WorkerResult properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-1: WorkerResult Unit Tests ---');
  await testWorkerResultStructure();
  console.log('--- All G8-1: WorkerResult Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
