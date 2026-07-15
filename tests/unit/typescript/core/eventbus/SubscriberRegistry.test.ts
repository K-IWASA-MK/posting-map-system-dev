import { SubscriberRegistry } from '../../../../../sdk/core/eventbus/SubscriberRegistry';
import { EventSubscription } from '../../../../../sdk/core/eventbus/EventSubscription';
import { EventChannel } from '../../../../../sdk/core/eventbus/EventChannel';
import { EventType } from '../../../../../sdk/core/eventbus/EventType';
import { EventSource } from '../../../../../sdk/core/eventbus/EventSource';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockSubscriber {
  public received: any[] = [];
  supportsChannel(c: EventChannel) { return c === EventChannel.EXECUTION; }
  supportsEventType(t: EventType) { return t === EventType.ExecutionStarted; }
  async onEvent(e: any) { this.received.push(e); }
  priority() { return 100; }
}

function runTests() {
  console.log('Running SubscriberRegistry tests...');

  const registry = new SubscriberRegistry();
  const sub = new MockSubscriber();
  
  const subscription: EventSubscription = {
    subscriptionId: 'SUB-1',
    subscriberName: 'MockSub',
    subscriber: sub
  };

  registry.register(subscription);
  assert(registry.getAll().length === 1, 'Registry should have 1 subscriber');

  // Test findSubscribersFor
  const mockEnvelope = {
    channel: EventChannel.EXECUTION,
    eventType: EventType.ExecutionStarted
  } as any;

  const matches = registry.findSubscribersFor(mockEnvelope);
  assert(matches.length === 1, 'Should match registered execution subscriber');

  const nonMatches = registry.findSubscribersFor({
    channel: EventChannel.SYSTEM,
    eventType: EventType.SystemBoot
  } as any);
  assert(nonMatches.length === 0, 'Should not match system channel events');

  // Deregister
  registry.deregister('SUB-1');
  assert(registry.getAll().length === 0, 'Registry should be empty after deregister');

  console.log('All SubscriberRegistry tests passed!');
}

runTests();
