import { AIAssignmentProfile } from '../../../aios/workforce/AIAssignmentProfile';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testProfileStructure() {
  console.log('[Test] AIAssignmentProfile structural properties starting...');

  const profile: AIAssignmentProfile = {
    assignmentName: "Daily Security Audit",
    assignmentType: "SCHEDULED",
    description: "Daily automated security scan assignment",
    metadata: { priority: "HIGH" }
  };

  assert(profile.assignmentName === "Daily Security Audit", "assignmentName mismatch");
  assert(profile.assignmentType === "SCHEDULED", "assignmentType mismatch");
  assert(profile.description === "Daily automated security scan assignment", "description mismatch");
  assert((profile.metadata as any).priority === "HIGH", "metadata mismatch");

  console.log('   ✓ AIAssignmentProfile structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-6: AIAssignmentProfile Unit Tests ---');
  await testProfileStructure();
  console.log('--- All G9-6: AIAssignmentProfile Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
