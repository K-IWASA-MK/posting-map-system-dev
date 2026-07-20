import { ExecutionContextState } from '../../../aios/execution/ExecutionContextState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionContextStateStructure() {
  console.log('[Test] ExecutionContextState properties starting...');

  const state: ExecutionContextState = {
    executionId: "exec-123",
    orchestrationId: "orch-456",
    runtimeId: "runtime-x",
    sessionId: "session-abc"
  };

  assert(state.executionId === "exec-123", "executionId mismatch");
  assert(state.orchestrationId === "orch-456", "orchestrationId mismatch");
  assert(state.runtimeId === "runtime-x", "runtimeId mismatch");
  assert(state.sessionId === "session-abc", "sessionId mismatch");

  console.log('   ✓ ExecutionContextState properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-4: ExecutionContextState Unit Tests ---');
  await testExecutionContextStateStructure();
  console.log('--- All G8-4: ExecutionContextState Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
