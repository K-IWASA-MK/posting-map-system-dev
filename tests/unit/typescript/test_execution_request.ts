import { ExecutionRequest } from '../../../aios/runtime/ExecutionRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionRequestStructure() {
  console.log('[Test] ExecutionRequest properties starting...');

  const request: ExecutionRequest = {
    requestId: "req-1",
    sessionId: "session-123",
    agentId: "agent-architecture",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    runtimeStage: "EXECUTION"
  };

  assert(request.requestId === "req-1", "requestId mismatch");
  assert(request.sessionId === "session-123", "sessionId mismatch");
  assert(request.agentId === "agent-architecture", "agentId mismatch");
  assert(request.protocolId === "aios-decision-v1", "protocolId mismatch");
  assert(request.protocolVersion === "1.0.0", "protocolVersion mismatch");
  assert(request.runtimeStage === "EXECUTION", "runtimeStage mismatch");

  console.log('   ✓ ExecutionRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-5: ExecutionRequest Unit Tests ---');
  await testExecutionRequestStructure();
  console.log('--- All G7-5: ExecutionRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
