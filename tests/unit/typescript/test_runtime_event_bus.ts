import { RuntimeEventBus } from '../../../core/runtime-event-bus/RuntimeEventBus';
import { RuntimeEvent } from '../../../core/runtime-event-bus/RuntimeEvent';
import { RuntimeEventType } from '../../../core/runtime-event-bus/RuntimeEventType';
import { IEventIdProvider } from '../../../core/runtime-event-bus/IEventIdProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Mock ID Provider returning fixed values for testing
class MockEventIdProvider implements IEventIdProvider {
  private count = 0;
  public generateEventId(): string {
    this.count++;
    return `event-uuid-${this.count}`;
  }
}

// ==============================================================================
// Test 1: Publish and Specific Type Subscriptions
// ==============================================================================
function testSpecificTypeSub() {
  console.log('[Test 1] Specific type subscription starting...');
  const provider = new MockEventIdProvider();
  const bus = new RuntimeEventBus(provider);

  const received: RuntimeEvent[] = [];
  const sub = bus.subscribe('SESSION_ACTIVE', (event) => {
    received.push(event);
  });

  const eventPackage: RuntimeEvent = {
    eventId: provider.generateEventId(),
    timestamp: Date.now(),
    type: 'SESSION_ACTIVE',
    source: 'ExecutionSession',
    payload: { sessionId: 'session-111' },
    sessionId: 'session-111'
  };

  bus.publish(eventPackage);

  assert(received.length === 1, 'Subscriber should receive the event');
  assert(received[0].eventId === 'event-uuid-1', 'Event ID mismatch');
  assert(received[0].type === 'SESSION_ACTIVE', 'Event type mismatch');
  assert(received[0].source === 'ExecutionSession', 'Event source mismatch');
  assert((received[0].payload as any).sessionId === 'session-111', 'Payload value mismatch');

  // Verify unsubscribe
  sub.unsubscribe();
  bus.publish(eventPackage);
  assert(received.length === 1, 'Should not receive event after unsubscribe');

  console.log('[Test 1] Specific type subscription: PASSED');
}

// ==============================================================================
// Test 2: Wildcard Subscriptions (subscribeAll)
// ==============================================================================
function testWildcardSub() {
  console.log('[Test 2] Wildcard subscription starting...');
  const provider = new MockEventIdProvider();
  const bus = new RuntimeEventBus(provider);

  const received: RuntimeEvent[] = [];
  bus.subscribeAll((event) => {
    received.push(event);
  });

  const ev1: RuntimeEvent = {
    eventId: provider.generateEventId(),
    timestamp: Date.now(),
    type: 'LAUNCH_REQUESTED',
    source: 'Launcher',
    payload: null
  };

  const ev2: RuntimeEvent = {
    eventId: provider.generateEventId(),
    timestamp: Date.now(),
    type: 'WORKSPACE_PREPARED',
    source: 'WorkspaceRuntime',
    payload: null
  };

  bus.publish(ev1);
  bus.publish(ev2);

  assert(received.length === 2, 'Wildcard subscriber should receive both events');
  assert(received[0].type === 'LAUNCH_REQUESTED', 'First event type mismatch');
  assert(received[1].type === 'WORKSPACE_PREPARED', 'Second event type mismatch');

  console.log('[Test 2] Wildcard subscription: PASSED');
}

// ==============================================================================
// Test 3: Subscriber Exception Isolation
// ==============================================================================
function testExceptionIsolation() {
  console.log('[Test 3] Subscriber exception isolation starting...');
  const provider = new MockEventIdProvider();
  const bus = new RuntimeEventBus(provider);

  let ranListenerB = false;

  // Listener A: Throws error
  bus.subscribe('PROCESS_EXITED', () => {
    throw new Error('Crash inside Subscriber A');
  });

  // Listener B: Executes normally
  bus.subscribe('PROCESS_EXITED', () => {
    ranListenerB = true;
  });

  const event: RuntimeEvent = {
    eventId: provider.generateEventId(),
    timestamp: Date.now(),
    type: 'PROCESS_EXITED',
    source: 'ExecutionRuntime',
    payload: { exitCode: 0 }
  };

  // Publisher should succeed without throwing exceptions
  let publishedSuccessfully = false;
  try {
    bus.publish(event);
    publishedSuccessfully = true;
  } catch (err) {
    publishedSuccessfully = false;
  }

  assert(publishedSuccessfully, 'EventBus.publish should isolate errors and not throw');
  assert(ranListenerB, 'Listener B should run successfully despite Listener A crashing');

  console.log('[Test 3] Subscriber exception isolation: PASSED');
}

// ==============================================================================
// Runner
// ==============================================================================
function runAllTests() {
  console.log('--- Starting Runtime Event Bus Foundation Unit Tests ---');
  testSpecificTypeSub();
  testWildcardSub();
  testExceptionIsolation();
  console.log('--- All Runtime Event Bus Foundation Unit Tests PASSED ---');
}

try {
  runAllTests();
} catch (err) {
  console.error('[Test Suite Error]', err);
  process.exit(1);
}
