import { AgentScheduler } from '../../../aios/runtime/AgentScheduler';
import { DeliveryResult } from '../../../aios/runtime/DeliveryResult';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAgentSchedulerNormal() {
  console.log('[Test] AgentScheduler normal scheduling starting...');

  const deliveryResult: DeliveryResult = {
    messageId: "msg-agent-architecture-to-agent-uiux-hash",
    routeId: "route-agent-architecture-to-agent-uiux",
    delivered: true,
    deliveredAt: "2026-07-20T12:00:00Z"
  };

  const plan = AgentScheduler.schedule(deliveryResult);
  assert(plan.scheduled === true, "Scheduled state mismatch");
  assert(plan.requestId === "req-msg-agent-architecture-to-agent-uiux-hash", "RequestId generation mismatch");
  assert(plan.retryPolicyId === "RETRY-POLICY-DEFAULT", "Default retryPolicyId mismatch");
  assert(plan.throttlePolicyId === "THROTTLE-POLICY-DEFAULT", "Default throttlePolicyId mismatch");

  // Verify Deterministic Routing Contract (Contract-03)
  const duplicatePlan = AgentScheduler.schedule(deliveryResult);
  assert(plan.requestId === duplicatePlan.requestId, "RequestId must be deterministic");
  assert(plan.scheduled === duplicatePlan.scheduled, "Scheduled state must be deterministic");
  assert(plan.retryPolicyId === duplicatePlan.retryPolicyId, "Retry policy mapping must be deterministic");

  console.log('   ✓ AgentScheduler normal scheduling: PASSED');
}

async function testAgentSchedulerAbnormal() {
  console.log('[Test] AgentScheduler abnormal boundary checks starting...');

  // 1. Missing DeliveryResult
  let threwMissingResult = false;
  try {
    AgentScheduler.schedule(null as any);
  } catch (err: any) {
    threwMissingResult = true;
    assert(err.message.includes("DeliveryResult cannot be null or undefined"), "Invalid error message");
  }
  assert(threwMissingResult, "Null delivery must throw an error");

  // 2. delivered = false
  const undeliveredResult: DeliveryResult = {
    messageId: "msg-id-1",
    routeId: "route-id-1",
    delivered: false,
    deliveredAt: "2026-07-20T12:00:00Z"
  };

  let threwUndelivered = false;
  try {
    AgentScheduler.schedule(undeliveredResult);
  } catch (err: any) {
    threwUndelivered = true;
    assert(err.message.includes("Message was not successfully delivered"), "Invalid error message");
  }
  assert(threwUndelivered, "Undelivered message must throw an error");

  // 3. Empty messageId
  const emptyMessageIdResult: DeliveryResult = {
    messageId: "",
    routeId: "route-id-1",
    delivered: true,
    deliveredAt: "2026-07-20T12:00:00Z"
  };

  let threwEmptyMsg = false;
  try {
    AgentScheduler.schedule(emptyMessageIdResult);
  } catch (err: any) {
    threwEmptyMsg = true;
    assert(err.message.includes("Invalid or empty messageId"), "Invalid error message");
  }
  assert(threwEmptyMsg, "Empty messageId must throw an error");

  // 4. Empty routeId
  const emptyRouteIdResult: DeliveryResult = {
    messageId: "msg-id-1",
    routeId: "",
    delivered: true,
    deliveredAt: "2026-07-20T12:00:00Z"
  };

  let threwEmptyRoute = false;
  try {
    AgentScheduler.schedule(emptyRouteIdResult);
  } catch (err: any) {
    threwEmptyRoute = true;
    assert(err.message.includes("Invalid or empty routeId"), "Invalid error message");
  }
  assert(threwEmptyRoute, "Empty routeId must throw an error");

  console.log('   ✓ AgentScheduler abnormal boundary checks: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-8: AgentScheduler Unit Tests ---');
  await testAgentSchedulerNormal();
  await testAgentSchedulerAbnormal();
  console.log('--- All G7-8: AgentScheduler Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
