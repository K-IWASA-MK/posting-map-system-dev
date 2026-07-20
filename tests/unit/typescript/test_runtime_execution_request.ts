import { RuntimeExecutionRequest } from '../../../aios/execution/RuntimeExecutionRequest';
import { ScheduleResult } from '../../../aios/runtime/ScheduleResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRuntimeExecutionRequestStructure() {
  console.log('[Test] RuntimeExecutionRequest properties starting...');

  const schedule: ScheduleResult = {
    requestId: "req-123",
    scheduled: true,
    retryPolicyId: "RETRY-POLICY-DEFAULT",
    throttlePolicyId: "THROTTLE-POLICY-DEFAULT"
  };

  const request: RuntimeExecutionRequest = {
    schedule
  };

  assert(request.schedule.requestId === "req-123", "requestId mismatch");
  assert(request.schedule.scheduled === true, "scheduled status mismatch");

  console.log('   ✓ RuntimeExecutionRequest properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-2: RuntimeExecutionRequest Unit Tests ---');
  await testRuntimeExecutionRequestStructure();
  console.log('--- All G8-2: RuntimeExecutionRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
