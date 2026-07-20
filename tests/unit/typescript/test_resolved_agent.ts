import { ResolvedAgent } from '../../../aios/runtime/ResolvedAgent';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResolvedAgentStructure() {
  console.log('[Test] ResolvedAgent properties starting...');

  const resolved: ResolvedAgent = {
    agentId: "agent-architecture",
    role: "Architect",
    promptProfile: "Instructions",
    capabilities: [
      { capabilityId: "CAP-RESOLVE-ARCH", description: "Review", version: "1.0.0" }
    ],
    allowedTools: ["read_file", "write_file"]
  };

  assert(resolved.agentId === "agent-architecture", "agentId mismatch");
  assert(resolved.role === "Architect", "role mismatch");
  assert(resolved.promptProfile === "Instructions", "promptProfile mismatch");
  assert(resolved.capabilities.length === 1, "Capabilities count mismatch");
  assert(resolved.allowedTools.includes("read_file"), "allowedTools mapping mismatch");

  console.log('   ✓ ResolvedAgent properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-6: ResolvedAgent Unit Tests ---');
  await testResolvedAgentStructure();
  console.log('--- All G7-6: ResolvedAgent Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
