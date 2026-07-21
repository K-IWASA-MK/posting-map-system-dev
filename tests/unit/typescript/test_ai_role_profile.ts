import { AIRoleProfile } from '../../../aios/workforce/AIRoleProfile';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testProfileStructure() {
  console.log('[Test] AIRoleProfile structural properties starting...');

  const profile: AIRoleProfile = {
    roleName: "QA Lead",
    roleType: "LEAD",
    description: "Leads testing and quality assurance",
    metadata: { level: "SENIOR" }
  };

  assert(profile.roleName === "QA Lead", "roleName mismatch");
  assert(profile.roleType === "LEAD", "roleType mismatch");
  assert(profile.description === "Leads testing and quality assurance", "description mismatch");
  assert((profile.metadata as any).level === "SENIOR", "metadata mismatch");

  console.log('   ✓ AIRoleProfile structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-5: AIRoleProfile Unit Tests ---');
  await testProfileStructure();
  console.log('--- All G9-5: AIRoleProfile Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
