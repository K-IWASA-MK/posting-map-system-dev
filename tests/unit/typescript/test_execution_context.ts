import { ExecutionContext } from '../../../aios/execution/ExecutionContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionContextStructure() {
  console.log('[Test] ExecutionContext properties starting...');

  const context: ExecutionContext = {
    executionId: "exec-123",
    runtimeId: "runtime-a",
    sessionId: "session-xyz"
  };

  assert(context.executionId === "exec-123", "executionId mismatch");
  assert(context.runtimeId === "runtime-a", "runtimeId mismatch");
  assert(context.sessionId === "session-xyz", "sessionId mismatch");

  console.log('   ✓ ExecutionContext properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-2: ExecutionContext Unit Tests ---');
  await testExecutionContextStructure();
  console.log('--- All G8-2: ExecutionContext Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
