import { ProtocolRouteRegistry } from '../../../aios/kernel/ProtocolRouteRegistry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRegistryResolutions() {
  console.log('[Test] ProtocolRouteRegistry mapping resolutions starting...');

  // 1. aios-governance-v1 dynamic resolution
  const payloadGov = {
    executors: ["agent-uiux", "agent-architecture"],
    reviewers: ["agent-security", "agent-architecture"]
  };
  const targetsGov = ProtocolRouteRegistry.resolve("aios-governance-v1", payloadGov);
  assert(targetsGov.length === 3, "Governance targets should de-duplicate to 3 elements");
  assert(targetsGov.includes("agent-uiux"), "Should include agent-uiux");
  assert(targetsGov.includes("agent-architecture"), "Should include agent-architecture");
  assert(targetsGov.includes("agent-security"), "Should include agent-security");

  // 2. aios-decision-v1 routing
  const targetsDec = ProtocolRouteRegistry.resolve("aios-decision-v1", {});
  assert(targetsDec.includes("agent-architecture") && targetsDec.includes("agent-uiux"), "Decision should route to architecture and uiux");

  // 3. aios-consensus-v1 routing
  const targetsCon = ProtocolRouteRegistry.resolve("aios-consensus-v1", {});
  assert(targetsCon.length === 1 && targetsCon[0] === "agent-architecture", "Consensus should default to agent-architecture");

  // 4. aios-capability-v1 routing
  const targetsCap = ProtocolRouteRegistry.resolve("aios-capability-v1", {});
  assert(targetsCap.length === 1 && targetsCap[0] === "agent-security", "Capability should route to agent-security");

  // 5. Unregistered Protocol routing
  const targetsUnknown = ProtocolRouteRegistry.resolve("unknown-protocol", {});
  assert(targetsUnknown.length === 0, "Unknown protocols should resolve to empty array");

  console.log('   ✓ ProtocolRouteRegistry mapping resolutions: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-3: ProtocolRouteRegistry Unit Tests ---');
  await testRegistryResolutions();
  console.log('--- All G7-3: ProtocolRouteRegistry Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
