import { ExecutionContextResult } from '../../../aios/execution/ExecutionContextResult';
import { ExecutionContextState } from '../../../aios/execution/ExecutionContextState';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionContextResultStructure() {
  console.log('[Test] ExecutionContextResult properties starting...');

  const context: ExecutionContextState = {
    executionId: "exec-123",
    orchestrationId: "orch-456",
    runtimeId: "runtime-x",
    sessionId: "session-abc"
  };

  const result: ExecutionContextResult = {
    context
  };

  assert(result.context.executionId === "exec-123", "executionId mismatch");
  assert(result.context.orchestrationId === "orch-456", "orchestrationId mismatch");

  console.log('   ✓ ExecutionContextResult properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-4: ExecutionContextResult Unit Tests ---');
  await testExecutionContextResultStructure();
  console.log('--- All G8-4: ExecutionContextResult Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
