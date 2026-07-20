import { WorkerContext } from '../../../aios/execution/WorkerContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testWorkerContextStructure() {
  console.log('[Test] WorkerContext properties starting...');

  const context: WorkerContext = {
    workerId: "worker-1",
    runtimeId: "runtime-a",
    sessionId: "session-xyz"
  };

  assert(context.workerId === "worker-1", "workerId mismatch");
  assert(context.runtimeId === "runtime-a", "runtimeId mismatch");
  assert(context.sessionId === "session-xyz", "sessionId mismatch");

  console.log('   ✓ WorkerContext properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-1: WorkerContext Unit Tests ---');
  await testWorkerContextStructure();
  console.log('--- All G8-1: WorkerContext Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
