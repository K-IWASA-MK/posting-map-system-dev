import { AIOrganizationRequest } from '../../../aios/workforce/AIOrganizationRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRequestStructure() {
  console.log('[Test] AIOrganizationRequest structural properties starting...');

  const request: AIOrganizationRequest = {
    organization: {
      organizationId: "org-test",
      profile: {
        organizationName: "Test Org",
        organizationType: "TEST",
        description: "Test description"
      },
      departments: [],
      version: 1
    }
  };

  assert(request.organization.organizationId === "org-test", "organizationId mismatch");
  assert(request.organization.profile.organizationName === "Test Org", "organizationName mismatch");

  console.log('   ✓ AIOrganizationRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-4: AIOrganizationRequest Unit Tests ---');
  await testRequestStructure();
  console.log('--- All G9-4: AIOrganizationRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
