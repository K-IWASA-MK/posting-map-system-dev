import { AIDepartment } from '../../../aios/workforce/AIDepartment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testDepartmentStructure() {
  console.log('[Test] AIDepartment structural properties starting...');

  const department: AIDepartment = {
    departmentId: "dept-eng-01",
    profile: {
      departmentName: "Engineering",
      departmentType: "CORE",
      description: "Software engineering group"
    },
    members: [
      { employeeId: "emp-101", roleId: "role-lead" },
      { employeeId: "emp-102", roleId: "role-developer" }
    ],
    version: 1,
    metadata: { active: true }
  };

  assert(department.departmentId === "dept-eng-01", "departmentId mismatch");
  assert(department.profile.departmentName === "Engineering", "profile name mismatch");
  assert(department.members.length === 2, "members length mismatch");
  assert(department.members[0].employeeId === "emp-101", "member employeeId mismatch");
  assert(department.version === 1, "version mismatch");

  console.log('   ✓ AIDepartment structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-3: AIDepartment Unit Tests ---');
  await testDepartmentStructure();
  console.log('--- All G9-3: AIDepartment Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
