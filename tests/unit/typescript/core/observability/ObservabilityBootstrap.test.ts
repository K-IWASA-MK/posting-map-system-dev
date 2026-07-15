import { ObservabilityBootstrap } from '../../../../../sdk/core/observability/bootstrap/ObservabilityBootstrap';
import { ObservabilityLifecycleManager, ObservabilityLifecycleState } from '../../../../../sdk/core/observability/bootstrap/ObservabilityLifecycleManager';
import { ObservabilityFactory } from '../../../../../sdk/core/observability/bootstrap/ObservabilityFactory';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockLedgerReader {
  async findByExecutionId() { return null; }
}

async function runTests() {
  console.log('Running ObservabilityBootstrap tests...');

  const lifecycle = new ObservabilityLifecycleManager();
  const factory = new ObservabilityFactory(new MockLedgerReader() as any);
  const bootstrap = new ObservabilityBootstrap(lifecycle, factory, {});

  // Test 1: Deterministic Initialization Order
  const report = await bootstrap.initialize();
  assert(lifecycle.getState() === ObservabilityLifecycleState.READY, 'Should transition to READY');
  assert(report.errors.length === 0, 'No errors on initialize');
  
  const expectedInitOrder = [
    'EventBus',
    'Telemetry',
    'Projection',
    'Metrics',
    'LiveMonitor',
    'LearningSource'
  ];
  assert(
    JSON.stringify(bootstrap.initLog) === JSON.stringify(expectedInitOrder),
    `Init order mismatch. Got: ${JSON.stringify(bootstrap.initLog)}`
  );

  // Test 2: Idempotency (Duplicated initialize should skip booting)
  const reportDup = await bootstrap.initialize();
  assert(reportDup.warnings.includes('Already initialized'), 'Should warn and skip on double init');

  // Test 3: Deterministic Reverse Shutdown Order
  const shutdownReport = await bootstrap.shutdown();
  assert(lifecycle.getState() === ObservabilityLifecycleState.SHUTDOWN, 'Should transition to SHUTDOWN');
  assert(shutdownReport.errors.length === 0, 'No errors on shutdown');

  const expectedShutdownOrder = [
    'LearningSource',
    'LiveMonitor',
    'Metrics',
    'Projection',
    'Telemetry',
    'EventBus'
  ];
  assert(
    JSON.stringify(bootstrap.shutdownLog) === JSON.stringify(expectedShutdownOrder),
    `Shutdown order mismatch. Got: ${JSON.stringify(bootstrap.shutdownLog)}`
  );

  console.log('All ObservabilityBootstrap tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
