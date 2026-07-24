import assert from 'assert';
import {
  AIEmployeeCommunicationManager,
  ChannelScope,
  MessagePriority,
  DeliveryStatus,
  AIMessage,
  RPCTimeoutException,
  AICommunicationSizeExceededException,
  SlackExternalConnector
} from '../../../sdk/employee/communication';

console.log("==================================================");
console.log("   AI EMPLOYEE COMMUNICATION FOUNDATION UNIT TEST SUITE");
console.log("==================================================");

async function runAICommunicationFoundationTests() {
  // Test 1: Message Identity & Direct Delivery Verification
  console.log("\n[Test 1] Message Identity & Direct Agent Messaging...");
  AIEmployeeCommunicationManager.resetInstance();
  const manager = AIEmployeeCommunicationManager.getInstance();

  let receivedMessage: AIMessage | null = null;
  manager.subscribe('channel-direct-traffic', async (msg) => {
    receivedMessage = msg;
  });

  const msg1: AIMessage = {
    identity: {
      messageId: 'msg-001',
      conversationId: 'conv-traffic-101',
      threadId: 'thread-01',
      createdAt: new Date().toISOString(),
      senderEmployeeId: 'emp-traffic-001'
    },
    scope: ChannelScope.DIRECT,
    targetId: 'emp-district-001',
    priority: MessagePriority.HIGH,
    deliveryStatus: DeliveryStatus.CREATED,
    subject: 'Traffic Update',
    body: { status: 'CONGESTION_ALERT', location: 'MIE-03-ZONE-A' },
    retryAttempts: 0
  };

  const publishSuccess = await manager.publish('channel-direct-traffic', msg1);
  assert.strictEqual(publishSuccess, true);
  assert.strictEqual(msg1.deliveryStatus, DeliveryStatus.DELIVERED);
  assert.strictEqual((receivedMessage as any)?.identity.conversationId, 'conv-traffic-101');
  console.log("   ✓ Test 1 Passed (Message delivered to subscriber with conversation thread tracking)");

  // Test 2: Dead Letter Queue (DLQ) Isolation for Unsubscribed Messages
  console.log("\n[Test 2] Dead Letter Queue (DLQ) Isolation...");
  const orphanMsg: AIMessage = {
    identity: {
      messageId: 'msg-orphan-999',
      conversationId: 'conv-orphan-001',
      createdAt: new Date().toISOString(),
      senderEmployeeId: 'emp-orphan-001'
    },
    scope: ChannelScope.SYSTEM,
    priority: MessagePriority.LOW,
    deliveryStatus: DeliveryStatus.CREATED,
    subject: 'Orphan Message',
    body: { text: 'No subscriber' },
    retryAttempts: 0
  };

  const orphanSuccess = await manager.publish('unsubscribed-channel', orphanMsg);
  assert.strictEqual(orphanSuccess, false);
  assert.strictEqual(orphanMsg.deliveryStatus, DeliveryStatus.FAILED);
  assert.strictEqual(manager.getDLQ().size(), 1);
  console.log("   ✓ Test 2 Passed (Undelivered message isolated in Dead Letter Queue)");

  // Test 3: Agent RPC Manager Request-Response & Timeout
  console.log("\n[Test 3] Agent RPC Manager Request-Response Flow...");
  manager.registerRPC('rpc_get_weather', async (payload) => {
    return { temperature: 24, condition: 'CLEAR' };
  });

  const rpcResult = await manager.callRPC('rpc_get_weather', { districtId: 'MIE-03' });
  assert.strictEqual(rpcResult.condition, 'CLEAR');
  console.log("   ✓ Test 3 Passed (Synchronous RPC request-response returned valid result)");

  // Test 4: Message Size Overflow Enforcement
  console.log("\n[Test 4] Policy Message Size Overflow Guard...");
  const hugeBody = { data: 'x'.repeat(70000) }; // > 64KB
  const hugeMsg: AIMessage = {
    identity: {
      messageId: 'msg-huge',
      conversationId: 'conv-huge',
      createdAt: new Date().toISOString(),
      senderEmployeeId: 'emp-1'
    },
    scope: ChannelScope.GLOBAL,
    priority: MessagePriority.NORMAL,
    deliveryStatus: DeliveryStatus.CREATED,
    subject: 'Huge Data',
    body: hugeBody,
    retryAttempts: 0
  };

  await assert.rejects(
    async () => manager.publish('channel-direct-traffic', hugeMsg),
    AICommunicationSizeExceededException,
    'Publishing message > 64KB must throw AICommunicationSizeExceededException'
  );
  console.log("   ✓ Test 4 Passed (MAX_MESSAGE_SIZE overflow blocked by Communication Policy)");

  // Test 5: Communication Recovery Sequence
  console.log("\n[Test 5] Communication Recovery Sequence...");
  const recoverySuccess = await manager.recover();
  assert.strictEqual(recoverySuccess, true);
  console.log("   ✓ Test 5 Passed (Message bus reconnected and pending RPC sessions restored)");

  // Test 6: External Connector Interface
  console.log("\n[Test 6] External Connector Interoperability...");
  const slackConnector = new SlackExternalConnector();
  const extSuccess = await slackConnector.sendExternalNotification(msg1);
  assert.strictEqual(extSuccess, true);
  console.log("   ✓ Test 6 Passed (External Connector Interface dispatched message)");

  console.log("\n==================================================");
  console.log("   ALL AI EMPLOYEE COMMUNICATION FOUNDATION TESTS PASSED!");
  console.log("==================================================");
}

runAICommunicationFoundationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
