import { AIDepartmentResponse } from '../../../aios/workforce/AIDepartmentResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponseStructure() {
  console.log('[Test] AIDepartmentResponse structural properties starting...');

  const response: AIDepartmentResponse = {
    department: {
      departmentId: "dept-ops",
      profile: {
        departmentName: "Operations",
        departmentType: "OPERATIONAL",
        description: "Field Operations"
      },
      members: [],
      version: 1
    }
  };

  assert(response.department.departmentId === "dept-ops", "departmentId mismatch");
  assert(response.department.profile.departmentName === "Operations", "departmentName mismatch");

  console.log('   ✓ AIDepartmentResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-3: AIDepartmentResponse Unit Tests ---');
  await testResponseStructure();
  console.log('--- All G9-3: AIDepartmentResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
