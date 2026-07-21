import { AIDepartmentProfile } from '../../../aios/workforce/AIDepartmentProfile';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testProfileStructure() {
  console.log('[Test] AIDepartmentProfile structural properties starting...');

  const profile: AIDepartmentProfile = {
    departmentName: "Engineering",
    departmentType: "DEVELOPMENT",
    description: "Core software engineering and architecture",
    metadata: { color: "#00FF00" }
  };

  assert(profile.departmentName === "Engineering", "departmentName mismatch");
  assert(profile.departmentType === "DEVELOPMENT", "departmentType mismatch");
  assert(profile.description === "Core software engineering and architecture", "description mismatch");
  assert((profile.metadata as any).color === "#00FF00", "metadata mismatch");

  console.log('   ✓ AIDepartmentProfile structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-3: AIDepartmentProfile Unit Tests ---');
  await testProfileStructure();
  console.log('--- All G9-3: AIDepartmentProfile Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
