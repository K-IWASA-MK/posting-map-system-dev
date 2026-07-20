import { AgentCommunicationBus } from '../../../aios/runtime/AgentCommunicationBus';
import { ResolvedAgent } from '../../../aios/runtime/ResolvedAgent';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAgentCommunicationBusNormal() {
  console.log('[Test] AgentCommunicationBus normal dispatch starting...');

  const sourceAgent: ResolvedAgent = {
    agentId: "agent-architecture",
    role: "Architect",
    promptProfile: "Architect role instructions",
    capabilities: [],
    allowedTools: []
  };

  const targetAgent: ResolvedAgent = {
    agentId: "agent-uiux",
    role: "UIUX Designer",
    promptProfile: "UIUX Designer role instructions",
    capabilities: [],
    allowedTools: []
  };

  const payload = { type: "REVIEW", payloadData: { file: "test.ts" } };

  const result1 = AgentCommunicationBus.dispatch(sourceAgent, targetAgent, payload);
  assert(result1.delivered === true, "Message should be delivered successfully");
  assert(result1.routeId === "route-agent-architecture-to-agent-uiux", "Route ID mismatch");

  // Verify Deterministic Routing Contract (Contract-03)
  const result2 = AgentCommunicationBus.dispatch(sourceAgent, targetAgent, payload);
  assert(result1.messageId === result2.messageId, "Message ID must be deterministic");
  assert(result1.routeId === result2.routeId, "Route ID must be deterministic");
  assert(result1.deliveredAt === result2.deliveredAt, "DeliveredAt timestamp must be deterministic");

  console.log('   ✓ AgentCommunicationBus normal dispatch: PASSED');
}

async function testAgentCommunicationBusAbnormal() {
  console.log('[Test] AgentCommunicationBus abnormal and boundary conditions starting...');

  const validAgent: ResolvedAgent = {
    agentId: "agent-architecture",
    role: "Architect",
    promptProfile: "Architect role instructions",
    capabilities: [],
    allowedTools: []
  };

  // 1. Missing target agent
  let threwTargetMissing = false;
  try {
    AgentCommunicationBus.dispatch(validAgent, null as any, { data: "hi" });
  } catch (err: any) {
    threwTargetMissing = true;
    assert(err.message.includes("Target agent context cannot be empty"), "Invalid error message");
  }
  assert(threwTargetMissing, "Dispatch with null target must throw an error");

  // 2. Missing source agent
  let threwSourceMissing = false;
  try {
    AgentCommunicationBus.dispatch(null as any, validAgent, { data: "hi" });
  } catch (err: any) {
    threwSourceMissing = true;
    assert(err.message.includes("Source agent context cannot be empty"), "Invalid error message");
  }
  assert(threwSourceMissing, "Dispatch with null source must throw an error");

  // 3. Undefined payload
  let threwUndefinedPayload = false;
  try {
    AgentCommunicationBus.dispatch(validAgent, validAgent, undefined);
  } catch (err: any) {
    threwUndefinedPayload = true;
    assert(err.message.includes("Message payload cannot be undefined"), "Invalid error message");
  }
  assert(threwUndefinedPayload, "Dispatch with undefined payload must throw an error");

  // 4. Self-Loop Route Verification
  const selfLoopResult = AgentCommunicationBus.dispatch(validAgent, validAgent, { hello: "self" });
  assert(selfLoopResult.routeId === "route-agent-architecture-to-agent-architecture", "Self loop routeId mismatch");
  assert(selfLoopResult.delivered === true, "Self loop message should be delivered");

  console.log('   ✓ AgentCommunicationBus abnormal and boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-7: AgentCommunicationBus Unit Tests ---');
  await testAgentCommunicationBusNormal();
  await testAgentCommunicationBusAbnormal();
  console.log('--- All G7-7: AgentCommunicationBus Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
