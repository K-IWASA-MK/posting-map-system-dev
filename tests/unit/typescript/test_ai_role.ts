import { AIRole } from '../../../aios/workforce/AIRole';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRoleStructure() {
  console.log('[Test] AIRole structural properties starting...');

  const role: AIRole = {
    roleId: "role-qa-lead",
    profile: {
      roleName: "QA Lead",
      roleType: "LEAD",
      description: "Leads testing"
    },
    responsibilities: [
      { responsibilityId: "resp-qa-01", responsibilityName: "Test Automation" }
    ],
    version: 1,
    metadata: { active: true }
  };

  assert(role.roleId === "role-qa-lead", "roleId mismatch");
  assert(role.profile.roleName === "QA Lead", "profile roleName mismatch");
  assert(role.responsibilities.length === 1, "responsibilities length mismatch");
  assert(role.responsibilities[0].responsibilityId === "resp-qa-01", "responsibilityId mismatch");
  assert(role.version === 1, "version mismatch");

  console.log('   ✓ AIRole structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-5: AIRole Unit Tests ---');
  await testRoleStructure();
  console.log('--- All G9-5: AIRole Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
