import { AIRoleRequest } from '../../../aios/workforce/AIRoleRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRequestStructure() {
  console.log('[Test] AIRoleRequest structural properties starting...');

  const request: AIRoleRequest = {
    role: {
      roleId: "role-sec-01",
      profile: {
        roleName: "Security Analyst",
        roleType: "SPECIALIST",
        description: "Security monitoring"
      },
      responsibilities: [],
      version: 1
    }
  };

  assert(request.role.roleId === "role-sec-01", "roleId mismatch");
  assert(request.role.profile.roleName === "Security Analyst", "roleName mismatch");

  console.log('   ✓ AIRoleRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-5: AIRoleRequest Unit Tests ---');
  await testRequestStructure();
  console.log('--- All G9-5: AIRoleRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
