import { AIEmployeeProfile } from '../../../aios/workforce/AIEmployeeProfile';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testProfileStructure() {
  console.log('[Test] AIEmployeeProfile structural properties starting...');

  const profile: AIEmployeeProfile = {
    employeeName: "Alice",
    departmentId: "dept-engineering",
    roleId: "role-qa-lead"
  };

  assert(profile.employeeName === "Alice", "employeeName mismatch");
  assert(profile.departmentId === "dept-engineering", "departmentId mismatch");
  assert(profile.roleId === "role-qa-lead", "roleId mismatch");

  console.log('   ✓ AIEmployeeProfile structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-1: AIEmployeeProfile Unit Tests ---');
  await testProfileStructure();
  console.log('--- All G9-1: AIEmployeeProfile Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
