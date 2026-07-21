import { AIDepartmentRequest } from '../../../aios/workforce/AIDepartmentRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRequestStructure() {
  console.log('[Test] AIDepartmentRequest structural properties starting...');

  const request: AIDepartmentRequest = {
    department: {
      departmentId: "dept-qa",
      profile: {
        departmentName: "Quality Assurance",
        departmentType: "SUPPORT",
        description: "QA and Verification"
      },
      members: [],
      version: 1
    }
  };

  assert(request.department.departmentId === "dept-qa", "departmentId mismatch");
  assert(request.department.profile.departmentName === "Quality Assurance", "departmentName mismatch");

  console.log('   ✓ AIDepartmentRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-3: AIDepartmentRequest Unit Tests ---');
  await testRequestStructure();
  console.log('--- All G9-3: AIDepartmentRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
