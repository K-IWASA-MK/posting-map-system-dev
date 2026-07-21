import { AIOrganization } from '../../../aios/workforce/AIOrganization';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testOrganizationStructure() {
  console.log('[Test] AIOrganization structural properties starting...');

  const org: AIOrganization = {
    organizationId: "org-global-01",
    profile: {
      organizationName: "Global AI Enterprises",
      organizationType: "ENTERPRISE",
      description: "Main Organization"
    },
    departments: [
      { departmentId: "dept-eng-01" },
      { departmentId: "dept-qa-01" }
    ],
    version: 1,
    metadata: { env: "prod" }
  };

  assert(org.organizationId === "org-global-01", "organizationId mismatch");
  assert(org.profile.organizationName === "Global AI Enterprises", "profile name mismatch");
  assert(org.departments.length === 2, "departments length mismatch");
  assert(org.departments[0].departmentId === "dept-eng-01", "departmentId mismatch");
  assert(org.version === 1, "version mismatch");

  console.log('   ✓ AIOrganization structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-4: AIOrganization Unit Tests ---');
  await testOrganizationStructure();
  console.log('--- All G9-4: AIOrganization Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
