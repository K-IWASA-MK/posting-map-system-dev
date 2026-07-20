import { AgentDefinition } from '../../../aios/runtime/AgentDefinition';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAgentDefinitionStructure() {
  console.log('[Test] AgentDefinition structural properties starting...');

  const definition: AgentDefinition = {
    agentId: "agent-architecture",
    role: "Architect",
    promptProfile: "Instructions",
    capabilities: [
      { capabilityId: "CAP-RESOLVE-ARCH", description: "Review", version: "1.0.0" }
    ],
    allowedTools: ["read_file", "write_file"]
  };

  assert(definition.agentId === "agent-architecture", "agentId mismatch");
  assert(definition.role === "Architect", "role mismatch");
  assert(definition.promptProfile === "Instructions", "promptProfile mismatch");
  assert(definition.capabilities.length === 1, "Capabilities count mismatch");
  assert(definition.allowedTools.includes("read_file"), "allowedTools mapping mismatch");

  console.log('   ✓ AgentDefinition structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-6: AgentDefinition Unit Tests ---');
  await testAgentDefinitionStructure();
  console.log('--- All G7-6: AgentDefinition Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
