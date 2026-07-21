import { AIOrganizationProfile } from '../../../aios/workforce/AIOrganizationProfile';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testProfileStructure() {
  console.log('[Test] AIOrganizationProfile structural properties starting...');

  const profile: AIOrganizationProfile = {
    organizationName: "Global AI Enterprises",
    organizationType: "ENTERPRISE",
    description: "Main Autonomous AI Organization",
    metadata: { region: "GLOBAL" }
  };

  assert(profile.organizationName === "Global AI Enterprises", "organizationName mismatch");
  assert(profile.organizationType === "ENTERPRISE", "organizationType mismatch");
  assert(profile.description === "Main Autonomous AI Organization", "description mismatch");
  assert((profile.metadata as any).region === "GLOBAL", "metadata mismatch");

  console.log('   ✓ AIOrganizationProfile structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-4: AIOrganizationProfile Unit Tests ---');
  await testProfileStructure();
  console.log('--- All G9-4: AIOrganizationProfile Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
