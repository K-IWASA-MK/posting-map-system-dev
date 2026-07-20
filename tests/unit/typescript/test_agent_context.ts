import { AgentContext } from '../../../aios/runtime/AgentContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAgentContextStructure() {
  console.log('[Test] AgentContext properties starting...');

  const context: AgentContext = {
    agentId: "agent-architecture",
    sessionId: "session-123",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    ledgerId: "block-1",
    createdAt: "2026-07-20T12:00:00Z"
  };

  assert(context.agentId === "agent-architecture", "agentId mismatch");
  assert(context.sessionId === "session-123", "sessionId mismatch");
  assert(context.protocolId === "aios-decision-v1", "protocolId mismatch");
  assert(context.protocolVersion === "1.0.0", "protocolVersion mismatch");
  assert(context.ledgerId === "block-1", "ledgerId mismatch");
  assert(context.createdAt === "2026-07-20T12:00:00Z", "createdAt mismatch");

  console.log('   ✓ AgentContext properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-5: AgentContext Unit Tests ---');
  await testAgentContextStructure();
  console.log('--- All G7-5: AgentContext Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
