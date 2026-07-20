import { RuntimeSession } from '../../../aios/runtime/RuntimeSession';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRuntimeSessionStructure() {
  console.log('[Test] RuntimeSession properties starting...');

  const session: RuntimeSession = {
    sessionId: "session-123",
    runtimeId: "runtime-architecture",
    startedAt: "2026-07-20T12:00:00Z",
    state: "CREATED"
  };

  assert(session.sessionId === "session-123", "sessionId mismatch");
  assert(session.runtimeId === "runtime-architecture", "runtimeId mismatch");
  assert(session.startedAt === "2026-07-20T12:00:00Z", "startedAt mismatch");
  assert(session.state === "CREATED", "state mismatch");

  console.log('   ✓ RuntimeSession properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-5: RuntimeSession Unit Tests ---');
  await testRuntimeSessionStructure();
  console.log('--- All G7-5: RuntimeSession Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
