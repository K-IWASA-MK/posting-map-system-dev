import { AIEmployeeLookupResponse } from '../../../aios/workforce/AIEmployeeLookupResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testLookupResponseStructure() {
  console.log('[Test] AIEmployeeLookupResponse structural properties starting...');

  const response: AIEmployeeLookupResponse = {
    employees: [],
    totalCount: 0,
    metadata: { cached: false }
  };

  assert(response.employees.length === 0, "employees mismatch");
  assert(response.totalCount === 0, "totalCount mismatch");
  assert((response.metadata as any).cached === false, "metadata mismatch");

  console.log('   ✓ AIEmployeeLookupResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-2: AIEmployeeLookupResponse Unit Tests ---');
  await testLookupResponseStructure();
  console.log('--- All G9-2: AIEmployeeLookupResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
