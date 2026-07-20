import { AIEmployeeStatus } from '../../../aios/workforce/AIEmployeeStatus';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testStatusStructure() {
  console.log('[Test] AIEmployeeStatus structural properties starting...');

  const status: AIEmployeeStatus = {
    state: "ACTIVE",
    availability: "HIGH"
  };

  assert(status.state === "ACTIVE", "state mismatch");
  assert(status.availability === "HIGH", "availability mismatch");

  console.log('   ✓ AIEmployeeStatus structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-1: AIEmployeeStatus Unit Tests ---');
  await testStatusStructure();
  console.log('--- All G9-1: AIEmployeeStatus Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
