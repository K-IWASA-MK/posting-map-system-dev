import { EventBus } from '../../../../../sdk/core/eventbus/EventBus';
import { EventChannel } from '../../../../../sdk/core/eventbus/EventChannel';
import { EventType } from '../../../../../sdk/core/eventbus/EventType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class SimpleSubscriber {
  public receivedCount = 0;
  supportsChannel(c: EventChannel) { return true; }
  supportsEventType(t: EventType) { return true; }
  async onEvent(e: any) { this.receivedCount++; }
  priority() { return 100; }
}

class NestedPublishSubscriber {
  private bus: EventBus;
  public innerReceived = false;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  supportsChannel(c: EventChannel) { return c === EventChannel.EXECUTION; }
  supportsEventType(t: EventType) { 
    return t === EventType.ExecutionStarted || t === EventType.PluginStarted; 
  }
  async onEvent(e: any) {
    if (e.correlationId === 'OUTER') {
      // Trigger a nested/reentrant publish
      const innerEnvelope = {
        eventId: 'EVT-INNER',
        eventType: EventType.PluginStarted,
        channel: EventChannel.EXECUTION,
        source: 'Plugin' as any,
        executionId: 'EXEC-1',
        correlationId: 'INNER',
        timestamp: new Date().toISOString(),
        payloadType: 'PluginStartedPayload',
        payload: {},
        schemaVersion: '1.0.0'
      };
      await this.bus.publish(innerEnvelope);
    } else if (e.correlationId === 'INNER') {
      this.innerReceived = true;
    }
  }
  priority() { return 100; }
}

async function runTests() {
  console.log('Running EventBus tests...');

  const bus = new EventBus();
  const sub1 = new SimpleSubscriber();

  bus.subscribe({ subscriptionId: 'SUB-A', subscriberName: 'SimpleSub', subscriber: sub1 });

  // 1. Regular Publish
  const dummyEnvelope = {
    eventId: 'EVT-1',
    eventType: EventType.ExecutionStarted,
    channel: EventChannel.EXECUTION,
    source: 'DevelopmentOS' as any,
    executionId: 'EXEC-1',
    correlationId: 'OUTER',
    timestamp: new Date().toISOString(),
    payloadType: 'ExecutionStartedPayload',
    payload: {},
    schemaVersion: '1.0.0'
  };

  const res = await bus.publish(dummyEnvelope);
  assert(res.success === true, 'Publish should succeed');
  assert(res.subscriberCount === 1, 'Should notify 1 subscriber');
  assert(sub1.receivedCount === 1, 'SimpleSubscriber should receive event');

  // 2. Unsubscribe
  bus.unsubscribe('SUB-A');
  const resAfterUnsub = await bus.publish(dummyEnvelope);
  assert(resAfterUnsub.subscriberCount === 0, 'Should notify 0 subscribers after unsubscribe');

  // 3. Nested/Reentrant Publish Test
  const nestedBus = new EventBus();
  const nestedSub = new NestedPublishSubscriber(nestedBus);
  nestedBus.subscribe({ subscriptionId: 'SUB-NESTED', subscriberName: 'NestedSub', subscriber: nestedSub });

  const outerEnvelope = {
    eventId: 'EVT-OUTER',
    eventType: EventType.ExecutionStarted,
    channel: EventChannel.EXECUTION,
    source: 'DevelopmentOS' as any,
    executionId: 'EXEC-1',
    correlationId: 'OUTER',
    timestamp: new Date().toISOString(),
    payloadType: 'ExecutionStartedPayload',
    payload: {},
    schemaVersion: '1.0.0'
  };

  await nestedBus.publish(outerEnvelope);
  assert(nestedSub.innerReceived === true, 'Nested subscriber should process the reentrant event synchronously');

  console.log('All EventBus tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
