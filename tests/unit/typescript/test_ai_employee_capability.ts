import { AIEmployeeCapability } from '../../../aios/workforce/AIEmployeeCapability';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testCapabilityStructure() {
  console.log('[Test] AIEmployeeCapability structural properties starting...');

  const capability: AIEmployeeCapability = {
    skills: ["typescript", "testing"],
    certifications: ["certified-scrum-master"],
    executionTypes: ["qa", "coding"]
  };

  assert(capability.skills.length === 2, "skills length mismatch");
  assert(capability.skills[0] === "typescript", "first skill mismatch");
  assert(capability.certifications.length === 1, "certifications length mismatch");
  assert(capability.executionTypes[0] === "qa", "first executionType mismatch");

  console.log('   ✓ AIEmployeeCapability structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-1: AIEmployeeCapability Unit Tests ---');
  await testCapabilityStructure();
  console.log('--- All G9-1: AIEmployeeCapability Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
