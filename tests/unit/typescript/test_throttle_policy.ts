import { ThrottlePolicy } from '../../../aios/runtime/ThrottlePolicy';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testThrottlePolicyStructure() {
  console.log('[Test] ThrottlePolicy properties starting...');

  const policy: ThrottlePolicy = {
    policyId: "THROTTLE-POLICY-DEFAULT",
    maxConcurrent: 5
  };

  assert(policy.policyId === "THROTTLE-POLICY-DEFAULT", "policyId mismatch");
  assert(policy.maxConcurrent === 5, "maxConcurrent mismatch");

  console.log('   ✓ ThrottlePolicy properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-8: ThrottlePolicy Unit Tests ---');
  await testThrottlePolicyStructure();
  console.log('--- All G7-8: ThrottlePolicy Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
