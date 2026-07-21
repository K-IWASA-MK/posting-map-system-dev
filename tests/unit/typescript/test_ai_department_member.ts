import { AIDepartmentMember } from '../../../aios/workforce/AIDepartmentMember';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testMemberStructure() {
  console.log('[Test] AIDepartmentMember structural properties starting...');

  const member: AIDepartmentMember = {
    employeeId: "emp-101",
    roleId: "role-lead",
    metadata: { assignedAt: "2026-07-21" }
  };

  assert(member.employeeId === "emp-101", "employeeId mismatch");
  assert(member.roleId === "role-lead", "roleId mismatch");
  assert((member.metadata as any).assignedAt === "2026-07-21", "metadata mismatch");

  console.log('   ✓ AIDepartmentMember structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-3: AIDepartmentMember Unit Tests ---');
  await testMemberStructure();
  console.log('--- All G9-3: AIDepartmentMember Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
