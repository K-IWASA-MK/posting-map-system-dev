import { AgentCapability } from '../../../aios/runtime/AgentCapability';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAgentCapabilityStructure() {
  console.log('[Test] AgentCapability structural typing starting...');

  const capability: AgentCapability = {
    capabilityId: "CAP-TEST",
    description: "Sample capability description",
    version: "1.2.3"
  };

  assert(capability.capabilityId === "CAP-TEST", "ID mismatch");
  assert(capability.description === "Sample capability description", "Description mismatch");
  assert(capability.version === "1.2.3", "Version mismatch");

  console.log('   ✓ AgentCapability structural typing: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-6: AgentCapability Unit Tests ---');
  await testAgentCapabilityStructure();
  console.log('--- All G7-6: AgentCapability Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
