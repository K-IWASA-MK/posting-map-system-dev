import { CoordinationContext } from '../../../aios/kernel/CoordinationContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testContextStructure() {
  console.log('[Test] CoordinationContext structure starting...');

  const context: CoordinationContext = {
    coordinationId: "co-12345",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    targetAgents: ["agent-architecture"],
    createdAt: "2026-07-20T12:00:00Z"
  };

  assert(context.coordinationId === "co-12345", "ID mismatch");
  assert(context.protocolId === "aios-decision-v1", "Protocol ID mismatch");
  assert(context.protocolVersion === "1.0.0", "Version mismatch");
  assert(context.targetAgents.includes("agent-architecture"), "Target mismatch");
  assert(context.createdAt === "2026-07-20T12:00:00Z", "Timestamp mismatch");

  console.log('   ✓ CoordinationContext structure: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-3: CoordinationContext Unit Tests ---');
  await testContextStructure();
  console.log('--- All G7-3: CoordinationContext Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
