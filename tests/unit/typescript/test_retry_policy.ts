import { RetryPolicy } from '../../../aios/runtime/RetryPolicy';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRetryPolicyStructure() {
  console.log('[Test] RetryPolicy properties starting...');

  const policy: RetryPolicy = {
    policyId: "RETRY-POLICY-DEFAULT",
    maxRetries: 3,
    retryIntervalMs: 1000
  };

  assert(policy.policyId === "RETRY-POLICY-DEFAULT", "policyId mismatch");
  assert(policy.maxRetries === 3, "maxRetries mismatch");
  assert(policy.retryIntervalMs === 1000, "retryIntervalMs mismatch");

  console.log('   ✓ RetryPolicy properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-8: RetryPolicy Unit Tests ---');
  await testRetryPolicyStructure();
  console.log('--- All G7-8: RetryPolicy Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
