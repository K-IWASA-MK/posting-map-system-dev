import { AIRoleResponsibility } from '../../../aios/workforce/AIRoleResponsibility';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponsibilityStructure() {
  console.log('[Test] AIRoleResponsibility structural properties starting...');

  const resp: AIRoleResponsibility = {
    responsibilityId: "resp-qa-01",
    responsibilityName: "Test Automation",
    description: "Automate E2E and unit test pipelines",
    metadata: { priority: "HIGH" }
  };

  assert(resp.responsibilityId === "resp-qa-01", "responsibilityId mismatch");
  assert(resp.responsibilityName === "Test Automation", "responsibilityName mismatch");
  assert(resp.description === "Automate E2E and unit test pipelines", "description mismatch");
  assert((resp.metadata as any).priority === "HIGH", "metadata mismatch");

  console.log('   ✓ AIRoleResponsibility structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-5: AIRoleResponsibility Unit Tests ---');
  await testResponsibilityStructure();
  console.log('--- All G9-5: AIRoleResponsibility Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
