import { AgentRegistry } from '../../../aios/runtime/AgentRegistry';
import { ExecutionRequest } from '../../../aios/runtime/ExecutionRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAgentRegistryNormal() {
  console.log('[Test] AgentRegistry normal resolution starting...');

  const request: ExecutionRequest = {
    requestId: "req-1",
    sessionId: "session-123",
    agentId: "agent-architecture",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    runtimeStage: "EXECUTION"
  };

  const resolved = AgentRegistry.resolve(request);
  assert(resolved.agentId === "agent-architecture", "agentId mismatch");
  assert(resolved.role === "Architect", "role mismatch");
  assert(resolved.promptProfile.includes("microkernel boundaries"), "promptProfile mismatch");
  assert(resolved.allowedTools.includes("git"), "allowedTools missing git");
  assert(resolved.capabilities.some(c => c.capabilityId === "CAP-RESOLVE-ARCH"), "capabilities mismatch");

  // Verify Deterministic Lookup Contract (Contract-04)
  const resolved2 = AgentRegistry.resolve(request);
  assert(resolved.agentId === resolved2.agentId, "Deterministic lookup failed on agentId");
  assert(resolved.role === resolved2.role, "Deterministic lookup failed on role");
  assert(resolved.promptProfile === resolved2.promptProfile, "Deterministic lookup failed on promptProfile");
  assert(resolved.allowedTools.join(',') === resolved2.allowedTools.join(','), "Deterministic lookup failed on allowedTools");

  console.log('   ✓ AgentRegistry normal resolution: PASSED');
}

async function testAgentRegistryAbnormal() {
  console.log('[Test] AgentRegistry abnormal boundary checks starting...');

  // 1. Unregistered Agent ID
  const requestUnknown: ExecutionRequest = {
    requestId: "req-1",
    sessionId: "session-123",
    agentId: "non-existent-agent",
    protocolId: "aios-decision-v1",
    protocolVersion: "1.0.0",
    runtimeStage: "EXECUTION"
  };

  let threwUnknown = false;
  try {
    AgentRegistry.resolve(requestUnknown);
  } catch (err: any) {
    threwUnknown = true;
    assert(err.message.includes("is not registered"), "Invalid error message for unknown agent ID");
  }
  assert(threwUnknown, "Resolving unknown agentId must throw an error");

  // 2. Empty Request
  let threwEmpty = false;
  try {
    AgentRegistry.resolve(null as any);
  } catch (err: any) {
    threwEmpty = true;
    assert(err.message.includes("contains empty or invalid agentId"), "Invalid error message for empty request");
  }
  assert(threwEmpty, "Resolving empty request must throw an error");

  console.log('   ✓ AgentRegistry abnormal boundary checks: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-6: AgentRegistry Unit Tests ---');
  await testAgentRegistryNormal();
  await testAgentRegistryAbnormal();
  console.log('--- All G7-6: AgentRegistry Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
