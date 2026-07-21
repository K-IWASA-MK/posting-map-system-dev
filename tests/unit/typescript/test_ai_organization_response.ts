import { AIOrganizationResponse } from '../../../aios/workforce/AIOrganizationResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponseStructure() {
  console.log('[Test] AIOrganizationResponse structural properties starting...');

  const response: AIOrganizationResponse = {
    organization: {
      organizationId: "org-resp-test",
      profile: {
        organizationName: "Resp Org",
        organizationType: "TEST",
        description: "Response Org Description"
      },
      departments: [],
      version: 1
    }
  };

  assert(response.organization.organizationId === "org-resp-test", "organizationId mismatch");
  assert(response.organization.profile.organizationName === "Resp Org", "organizationName mismatch");

  console.log('   ✓ AIOrganizationResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-4: AIOrganizationResponse Unit Tests ---');
  await testResponseStructure();
  console.log('--- All G9-4: AIOrganizationResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
