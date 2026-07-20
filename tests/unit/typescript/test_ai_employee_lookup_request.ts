import { AIEmployeeLookupRequest } from '../../../aios/workforce/AIEmployeeLookupRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testLookupRequestStructure() {
  console.log('[Test] AIEmployeeLookupRequest structural properties starting...');

  // Verification of optional condition support
  const minimalRequest: AIEmployeeLookupRequest = {};
  assert(minimalRequest.employeeId === undefined, "employeeId should be undefined");
  assert(minimalRequest.capability === undefined, "capability should be undefined");

  const fullRequest: AIEmployeeLookupRequest = {
    employeeId: "emp-111",
    capability: "typescript",
    roleId: "role-developer",
    departmentId: "dept-engineering",
    metadata: { searchStrategy: "strict" }
  };

  assert(fullRequest.employeeId === "emp-111", "employeeId mismatch");
  assert(fullRequest.capability === "typescript", "capability mismatch");
  assert(fullRequest.roleId === "role-developer", "roleId mismatch");
  assert(fullRequest.departmentId === "dept-engineering", "departmentId mismatch");
  assert((fullRequest.metadata as any).searchStrategy === "strict", "metadata mismatch");

  console.log('   ✓ AIEmployeeLookupRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-2: AIEmployeeLookupRequest Unit Tests ---');
  await testLookupRequestStructure();
  console.log('--- All G9-2: AIEmployeeLookupRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
