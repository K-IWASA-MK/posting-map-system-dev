import { AIRoleResponse } from '../../../aios/workforce/AIRoleResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponseStructure() {
  console.log('[Test] AIRoleResponse structural properties starting...');

  const response: AIRoleResponse = {
    role: {
      roleId: "role-dev-01",
      profile: {
        roleName: "Backend Engineer",
        roleType: "MEMBER",
        description: "API development"
      },
      responsibilities: [],
      version: 1
    }
  };

  assert(response.role.roleId === "role-dev-01", "roleId mismatch");
  assert(response.role.profile.roleName === "Backend Engineer", "roleName mismatch");

  console.log('   ✓ AIRoleResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-5: AIRoleResponse Unit Tests ---');
  await testResponseStructure();
  console.log('--- All G9-5: AIRoleResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
