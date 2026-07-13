import { ObservabilityOS } from '../../../../../../sdk/core/aios/observability/ObservabilityOS';
import { ObservabilityBootstrap } from '../../../../../../sdk/core/aios/observability/bootstrap/ObservabilityBootstrap';
import { ObservabilityLifecycleManager, ObservabilityLifecycleState } from '../../../../../../sdk/core/aios/observability/bootstrap/ObservabilityLifecycleManager';
import { ObservabilityFactory } from '../../../../../../sdk/core/aios/observability/bootstrap/ObservabilityFactory';
import { ObservabilityHealthProvider } from '../../../../../../sdk/core/aios/observability/bootstrap/ObservabilityHealthProvider';
import { ObservabilityVersionProvider } from '../../../../../../sdk/core/aios/observability/bootstrap/ObservabilityVersionProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockLedgerReader {
  async findByExecutionId() { return null; }
}

async function runTests() {
  console.log('Running ObservabilityOS Integration tests...');

  const lifecycle = new ObservabilityLifecycleManager();
  const factory = new ObservabilityFactory(new MockLedgerReader() as any);
  const bootstrap = new ObservabilityBootstrap(lifecycle, factory, {});
  const health = new ObservabilityHealthProvider(lifecycle, () => bootstrap.getRuntime());
  const version = new ObservabilityVersionProvider();

  const os = new ObservabilityOS(bootstrap, health, version);

  // Test 1: Pre-init exception checks (Component Isolation)
  let threwPreInit = false;
  try {
    os.monitor();
  } catch (e) {
    threwPreInit = true;
  }
  assert(threwPreInit, 'Should block monitor access before initialize');

  // Test 2: Full startup E2E scenario
  await os.initialize();
  assert(lifecycle.getState() === ObservabilityLifecycleState.READY, 'Subsystem ready');

  // Test 3: Fetch monitors and data loaders
  const monitor = os.monitor();
  assert(monitor !== undefined, 'LiveMonitor composite accessible');

  const { resolver } = os.learningSource();
  assert(resolver !== undefined, 'LearningSource resolver accessible');

  // Test 4: Health and Version metadata checks
  const healthReport = await os.health();
  assert(healthReport.status === ObservabilityLifecycleState.READY, 'Health state matches READY');
  assert(healthReport.components.length === 6, 'Should describe 6 components');

  const versionReport = os.version();
  assert(versionReport.sprint === '8', 'Sprint version matches');

  // Test 5: Shutdown E2E integration
  await os.shutdown();
  assert(lifecycle.getState() === ObservabilityLifecycleState.SHUTDOWN, 'Subsystem shutdown completed');

  console.log('All ObservabilityOS Integration tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
