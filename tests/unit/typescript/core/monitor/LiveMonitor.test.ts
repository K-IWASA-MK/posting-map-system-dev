import { LiveMonitor } from '../../../../../sdk/core/monitor/LiveMonitor';
import { MonitorRegistry } from '../../../../../sdk/core/monitor/MonitorRegistry';
import { MonitorStatus } from '../../../../../sdk/core/monitor/MonitorStatus';
import { InMemoryProjectionRepository } from '../../../../../sdk/core/projection/InMemoryProjectionRepository';
import { InMemoryMetricsRepository } from '../../../../../sdk/core/metrics/InMemoryMetricsRepository';
import { MonitorFactory } from '../../../../../sdk/core/monitor/MonitorFactory';
import { ProjectionState } from '../../../../../sdk/core/projection/ProjectionState';
import { ProjectionStage } from '../../../../../sdk/core/projection/ProjectionStage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockCustomMonitor {
  name() { return 'custom'; }
  supports(type: string) { return type === 'custom'; }
  async query() { return { testValue: 99 }; }
}

async function runTests() {
  console.log('Running LiveMonitor integration tests...');

  const projectionRepo = new InMemoryProjectionRepository();
  const metricsRepo = new InMemoryMetricsRepository();

  // Test 1: Empty Repository test
  const monitor = MonitorFactory.create(projectionRepo, metricsRepo);
  const snap1 = await monitor.snapshot();
  
  assert(snap1.health.status === MonitorStatus.UNKNOWN, 'Empty repos should yield UNKNOWN status');
  assert(snap1.sessions.active === 0, 'No active sessions');
  assert(snap1.snapshotVersion === 1, 'Initial snapshot version should be 1');

  // Test 2: Snapshot Version Unchanged Test (Version should not increment if data did not change)
  const snap2 = await monitor.snapshot();
  assert(snap2.snapshotVersion === 1, 'Version should remain 1 when data remains unchanged');

  // Test 3: Version increment on data change
  await projectionRepo.save({
    projectionVersion: 1,
    generatedAt: '',
    projection: {
      projectionId: 'P1',
      executionId: 'EX-1',
      correlationId: 'C-1',
      currentStage: ProjectionStage.NONE,
      status: ProjectionState.READY,
      source: 'System',
      updatedAt: '',
      schemaVersion: ''
    }
  });

  const snap3 = await monitor.snapshot();
  assert(snap3.snapshotVersion === 2, 'Version should increment to 2 on repository changes');
  assert(snap3.health.status === MonitorStatus.READY, 'Should dynamically resolve READY status');

  // Test 4: Composite Extension (Open/Closed verification)
  const registry = new MonitorRegistry();
  registry.register(new MockCustomMonitor());
  const customMonitor = new LiveMonitor(registry);

  const customSnap = await customMonitor.snapshot();
  assert((customSnap as any).custom !== undefined, 'LiveMonitor should composite registered MockCustomMonitor dynamic queries');
  assert((customSnap as any).custom.testValue === 99, 'Composite monitor values should align');

  // Test 5: Immutability (Object.freeze)
  let throwsOnMutate = false;
  try {
    (snap3 as any).health.status = MonitorStatus.ERROR;
  } catch (e) {
    throwsOnMutate = true;
  }
  assert(throwsOnMutate, 'MonitorSnapshot must be completely frozen');

  console.log('All LiveMonitor integration tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
