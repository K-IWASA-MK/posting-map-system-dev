import { RuntimeMonitoringService } from '../../../core/runtime-monitoring/RuntimeMonitoringService';
import { RuntimeEventBus } from '../../../core/runtime-event-bus/RuntimeEventBus';
import { RuntimeEvent } from '../../../core/runtime-event-bus/RuntimeEvent';
import { IEventIdProvider } from '../../../core/runtime-event-bus/IEventIdProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockEventIdProvider implements IEventIdProvider {
  private count = 0;
  public generateEventId(): string {
    this.count++;
    return `event-uuid-${this.count}`;
  }
}

// ==============================================================================
// Test 1: Event counters increment on publication
// ==============================================================================
function testMonitoringCounters() {
  console.log('[Test 1] Monitoring counters starting...');
  const idProvider = new MockEventIdProvider();
  const eventBus = new RuntimeEventBus(idProvider);
  const monitoring = new RuntimeMonitoringService(eventBus);

  const mockPub = (type: any) => {
    eventBus.publish({
      eventId: idProvider.generateEventId(),
      timestamp: Date.now(),
      type,
      source: 'Launcher',
      payload: {}
    });
  };

  mockPub('LAUNCH_REQUESTED');
  mockPub('SESSION_ACTIVE');

  let snap = monitoring.getSnapshot();
  assert(snap.totalLaunches === 1, `Expected totalLaunches to be 1, got ${snap.totalLaunches}`);
  assert(snap.activeSessionsCount === 1, `Expected activeSessionsCount to be 1, got ${snap.activeSessionsCount}`);

  mockPub('SESSION_COMPLETED');
  snap = monitoring.getSnapshot();
  assert(snap.activeSessionsCount === 0, `Expected activeSessionsCount to decrease to 0, got ${snap.activeSessionsCount}`);
  assert(snap.totalCompleted === 1, `Expected totalCompleted to be 1, got ${snap.totalCompleted}`);

  mockPub('SESSION_ACTIVE');
  mockPub('SESSION_FAILED');
  snap = monitoring.getSnapshot();
  assert(snap.activeSessionsCount === 0, `Expected activeSessionsCount to decrease to 0, got ${snap.activeSessionsCount}`);
  assert(snap.totalFailed === 1, `Expected totalFailed to be 1, got ${snap.totalFailed}`);

  console.log('[Test 1] Monitoring counters: PASSED');
  monitoring.stop();
}

// ==============================================================================
// Test 2: Workspace locks & permissions count
// ==============================================================================
function testLocksAndPermissions() {
  console.log('[Test 2] Locks and permissions counters starting...');
  const idProvider = new MockEventIdProvider();
  const eventBus = new RuntimeEventBus(idProvider);
  const monitoring = new RuntimeMonitoringService(eventBus);

  const mockPub = (type: any) => {
    eventBus.publish({
      eventId: idProvider.generateEventId(),
      timestamp: Date.now(),
      type,
      source: 'WorkspaceRuntime',
      payload: {}
    });
  };

  mockPub('WORKSPACE_LOCKED');
  mockPub('PLUGIN_PERMISSION_DENIED');

  const snap = monitoring.getSnapshot();
  assert(snap.workspaceLocksBlocked === 1, `Expected workspaceLocksBlocked to be 1, got ${snap.workspaceLocksBlocked}`);
  assert(snap.permissionDenials === 1, `Expected permissionDenials to be 1, got ${snap.permissionDenials}`);

  console.log('[Test 2] Locks and permissions counters: PASSED');
  monitoring.stop();
}

// ==============================================================================
// Test 3: Snapshot metadata and Reset API
// ==============================================================================
function testSnapshotAndReset() {
  console.log('[Test 3] Snapshot metadata and Reset API starting...');
  const idProvider = new MockEventIdProvider();
  const eventBus = new RuntimeEventBus(idProvider);
  const monitoring = new RuntimeMonitoringService(eventBus);

  const mockPub = (type: any) => {
    eventBus.publish({
      eventId: idProvider.generateEventId(),
      timestamp: Date.now(),
      type,
      source: 'Launcher',
      payload: {}
    });
  };

  mockPub('LAUNCH_REQUESTED');
  
  let snap = monitoring.getSnapshot();
  assert(snap.timestamp > 0, 'Expected positive epoch timestamp');
  assert(snap.uptimeMs >= 0, 'Expected non-negative uptimeMs');
  assert(snap.totalLaunches === 1, 'Expected totalLaunches to be 1');

  // Reset
  monitoring.reset();
  snap = monitoring.getSnapshot();
  assert(snap.totalLaunches === 0, 'Expected totalLaunches reset to 0');
  assert(snap.activeSessionsCount === 0, 'Expected activeSessionsCount reset to 0');

  console.log('[Test 3] Snapshot metadata and Reset API: PASSED');
  monitoring.stop();
}

// ==============================================================================
// Test 4: Stop cleanup (Subscription release)
// ==============================================================================
function testStopCleanup() {
  console.log('[Test 4] Stop cleanup starting...');
  const idProvider = new MockEventIdProvider();
  const eventBus = new RuntimeEventBus(idProvider);
  const monitoring = new RuntimeMonitoringService(eventBus);

  const mockPub = (type: any) => {
    eventBus.publish({
      eventId: idProvider.generateEventId(),
      timestamp: Date.now(),
      type,
      source: 'Launcher',
      payload: {}
    });
  };

  mockPub('LAUNCH_REQUESTED');
  let snap = monitoring.getSnapshot();
  assert(snap.totalLaunches === 1, 'Expected launches increment');

  // Stop
  monitoring.stop();

  // Publish again - should be isolated/not received
  mockPub('LAUNCH_REQUESTED');
  snap = monitoring.getSnapshot();
  assert(snap.totalLaunches === 1, 'Expected launches count to remain 1 after stop');

  console.log('[Test 4] Stop cleanup: PASSED');
}

// ==============================================================================
// Runner
// ==============================================================================
function runAllTests() {
  console.log('--- Starting Runtime Monitoring Foundation Unit Tests ---');
  testMonitoringCounters();
  testLocksAndPermissions();
  testSnapshotAndReset();
  testStopCleanup();
  console.log('--- All Runtime Monitoring Foundation Unit Tests PASSED ---');
}

try {
  runAllTests();
} catch (err) {
  console.error('[Test Suite Error]', err);
  process.exit(1);
}
