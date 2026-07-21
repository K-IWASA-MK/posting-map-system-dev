import { AIAssignmentTarget } from '../../../aios/workforce/AIAssignmentTarget';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testTargetStructure() {
  console.log('[Test] AIAssignmentTarget structural properties starting...');

  const target: AIAssignmentTarget = {
    targetId: "target-doc-101",
    targetType: "DOCUMENT",
    metadata: { path: "/docs/specifications/AIAssignment.md" }
  };

  assert(target.targetId === "target-doc-101", "targetId mismatch");
  assert(target.targetType === "DOCUMENT", "targetType mismatch");
  assert((target.metadata as any).path === "/docs/specifications/AIAssignment.md", "metadata mismatch");

  console.log('   ✓ AIAssignmentTarget structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-6: AIAssignmentTarget Unit Tests ---');
  await testTargetStructure();
  console.log('--- All G9-6: AIAssignmentTarget Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
