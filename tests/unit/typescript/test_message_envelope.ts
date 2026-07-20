import { MessageEnvelope } from '../../../aios/runtime/MessageEnvelope';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testMessageEnvelopeStructure() {
  console.log('[Test] MessageEnvelope properties starting...');

  const envelope: MessageEnvelope = {
    messageId: "msg-123",
    sourceAgentId: "agent-architecture",
    targetAgentId: "agent-uiux",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    messageType: "REQUEST",
    payload: { action: "REVIEW" },
    createdAt: "2026-07-20T12:00:00Z"
  };

  assert(envelope.messageId === "msg-123", "messageId mismatch");
  assert(envelope.sourceAgentId === "agent-architecture", "sourceAgentId mismatch");
  assert(envelope.targetAgentId === "agent-uiux", "targetAgentId mismatch");
  assert(envelope.protocolId === "aios-decision-v1", "protocolId mismatch");
  assert(envelope.protocolVersion === "1.0.0", "protocolVersion mismatch");
  assert(envelope.messageType === "REQUEST", "messageType mismatch");
  assert((envelope.payload as any).action === "REVIEW", "payload mismatch");
  assert(envelope.createdAt === "2026-07-20T12:00:00Z", "createdAt mismatch");

  console.log('   ✓ MessageEnvelope properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-7: MessageEnvelope Unit Tests ---');
  await testMessageEnvelopeStructure();
  console.log('--- All G7-7: MessageEnvelope Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
