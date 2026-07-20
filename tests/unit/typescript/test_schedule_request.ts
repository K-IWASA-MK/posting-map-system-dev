import { ScheduleRequest } from '../../../aios/runtime/ScheduleRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testScheduleRequestStructure() {
  console.log('[Test] ScheduleRequest properties starting...');

  const request: ScheduleRequest = {
    requestId: "req-1",
    messageId: "msg-123",
    routeId: "route-1",
    priority: "HIGH"
  };

  assert(request.requestId === "req-1", "requestId mismatch");
  assert(request.messageId === "msg-123", "messageId mismatch");
  assert(request.routeId === "route-1", "routeId mismatch");
  assert(request.priority === "HIGH", "priority mismatch");

  console.log('   ✓ ScheduleRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-8: ScheduleRequest Unit Tests ---');
  await testScheduleRequestStructure();
  console.log('--- All G7-8: ScheduleRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
