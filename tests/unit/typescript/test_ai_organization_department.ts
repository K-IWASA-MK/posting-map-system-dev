import { AIOrganizationDepartment } from '../../../aios/workforce/AIOrganizationDepartment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testDepartmentStructure() {
  console.log('[Test] AIOrganizationDepartment structural properties starting...');

  const orgDept: AIOrganizationDepartment = {
    departmentId: "dept-eng-01",
    metadata: { isPrimary: true }
  };

  assert(orgDept.departmentId === "dept-eng-01", "departmentId mismatch");
  assert((orgDept.metadata as any).isPrimary === true, "metadata mismatch");

  console.log('   ✓ AIOrganizationDepartment structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-4: AIOrganizationDepartment Unit Tests ---');
  await testDepartmentStructure();
  console.log('--- All G9-4: AIOrganizationDepartment Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
