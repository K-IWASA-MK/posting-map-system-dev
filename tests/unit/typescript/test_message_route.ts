import { MessageRoute } from '../../../aios/runtime/MessageRoute';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testMessageRouteStructure() {
  console.log('[Test] MessageRoute properties starting...');

  const route: MessageRoute = {
    sourceAgentId: "agent-architecture",
    targetAgentId: "agent-uiux",
    routeId: "route-agent-architecture-to-agent-uiux"
  };

  assert(route.sourceAgentId === "agent-architecture", "sourceAgentId mismatch");
  assert(route.targetAgentId === "agent-uiux", "targetAgentId mismatch");
  assert(route.routeId === "route-agent-architecture-to-agent-uiux", "routeId mismatch");

  console.log('   ✓ MessageRoute properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-7: MessageRoute Unit Tests ---');
  await testMessageRouteStructure();
  console.log('--- All G7-7: MessageRoute Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
