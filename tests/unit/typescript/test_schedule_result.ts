import { ScheduleResult } from '../../../aios/runtime/ScheduleResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testScheduleResultStructure() {
  console.log('[Test] ScheduleResult properties starting...');

  const result: ScheduleResult = {
    requestId: "req-1",
    scheduled: true,
    retryPolicyId: "RETRY-POLICY-DEFAULT",
    throttlePolicyId: "THROTTLE-POLICY-DEFAULT"
  };

  assert(result.requestId === "req-1", "requestId mismatch");
  assert(result.scheduled === true, "scheduled flag mismatch");
  assert(result.retryPolicyId === "RETRY-POLICY-DEFAULT", "retryPolicyId mismatch");
  assert(result.throttlePolicyId === "THROTTLE-POLICY-DEFAULT", "throttlePolicyId mismatch");

  console.log('   ✓ ScheduleResult properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-8: ScheduleResult Unit Tests ---');
  await testScheduleResultStructure();
  console.log('--- All G7-8: ScheduleResult Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
