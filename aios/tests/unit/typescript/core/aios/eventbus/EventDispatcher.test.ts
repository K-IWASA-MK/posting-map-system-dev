import { EventDispatcher } from '../../../../../../sdk/core/aios/eventbus/EventDispatcher';
import { SubscriberRegistry } from '../../../../../../sdk/core/aios/eventbus/SubscriberRegistry';
import { EventSubscription } from '../../../../../../sdk/core/aios/eventbus/EventSubscription';
import { EventChannel } from '../../../../../../sdk/core/aios/eventbus/EventChannel';
import { EventType } from '../../../../../../sdk/core/aios/eventbus/EventType';
import { DispatchMode, ExceptionPolicy } from '../../../../../../sdk/core/aios/eventbus/EventBusConfiguration';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class OrderingSubscriber {
  private id: string;
  private orderList: string[];
  private prio: number;

  constructor(id: string, prio: number, orderList: string[]) {
    this.id = id;
    this.prio = prio;
    this.orderList = orderList;
  }

  supportsChannel(c: EventChannel) { return true; }
  supportsEventType(t: EventType) { return true; }
  async onEvent(e: any) {
    this.orderList.push(this.id);
  }
  priority() { return this.prio; }
}

class CrashingSubscriber {
  supportsChannel(c: EventChannel) { return true; }
  supportsEventType(t: EventType) { return true; }
  async onEvent(e: any) {
    throw new Error('CrashingSubscriber Error');
  }
  priority() { return 100; }
}

async function runTests() {
  console.log('Running EventDispatcher tests...');

  const config = {
    dispatchMode: DispatchMode.SYNCHRONOUS,
    strictOrdering: true,
    exceptionPolicy: ExceptionPolicy.PROPAGATE
  };

  // Test 1: Ordering by priority
  const registry1 = new SubscriberRegistry();
  const orderList: string[] = [];
  
  registry1.register({ subscriptionId: 'S1', subscriberName: 'LowPrio', subscriber: new OrderingSubscriber('LowPrio', 50, orderList) });
  registry1.register({ subscriptionId: 'S2', subscriberName: 'HighPrio', subscriber: new OrderingSubscriber('HighPrio', 200, orderList) });
  registry1.register({ subscriptionId: 'S3', subscriberName: 'MedPrio', subscriber: new OrderingSubscriber('MedPrio', 100, orderList) });

  const dispatcher1 = new EventDispatcher(registry1, config);
  const dummyEnvelope = { channel: EventChannel.EXECUTION, eventType: EventType.ExecutionStarted } as any;

  await dispatcher1.dispatch(dummyEnvelope);

  assert(orderList[0] === 'HighPrio', 'High priority should run first');
  assert(orderList[1] === 'MedPrio', 'Medium priority should run second');
  assert(orderList[2] === 'LowPrio', 'Low priority should run last');

  // Test 2: Exception Propagation
  const registry2 = new SubscriberRegistry();
  registry2.register({ subscriptionId: 'Crash', subscriberName: 'Crash', subscriber: new CrashingSubscriber() });
  
  const dispatcher2 = new EventDispatcher(registry2, config);
  let threwException = false;
  try {
    await dispatcher2.dispatch(dummyEnvelope);
  } catch (e: any) {
    threwException = true;
    assert(e.message === 'CrashingSubscriber Error', 'Should propagate custom crash error');
  }
  assert(threwException, 'Exceptions should be propagated upwards');

  console.log('All EventDispatcher tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
