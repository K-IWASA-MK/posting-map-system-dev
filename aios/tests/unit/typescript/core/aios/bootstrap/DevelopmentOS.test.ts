import { DevelopmentOS } from '../../../../../../sdk/core/aios/DevelopmentOS';
import { DevelopmentContextBuilder } from '../../../../../../sdk/core/aios/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../../sdk/core/aios/context/DevelopmentContextType';
import { AIOSState } from '../../../../../../sdk/core/aios/bootstrap/LifecycleManager';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('Running DevelopmentOS tests...');
  
  const config = {
    plugins: [],
    reviewers: [],
    storageAdapter: 'json',
    runtimePolicy: {
      executionTimeoutMs: 10000,
      retryCount: 3,
      failFast: true
    },
    environment: 'test'
  };

  const os = new DevelopmentOS(config);

  // 1. Initial state
  assert(os.health().state === AIOSState.BOOTING, 'Initial state should be BOOTING');

  // 2. Initialize
  await os.initialize();
  assert(os.health().state === AIOSState.READY, 'State should be READY after initialize');

  // 3. Idempotency test
  await os.initialize();
  assert(os.health().state === AIOSState.READY, 'State should still be READY after double initialize');

  // 4. Empty request test
  let errorThrown = false;
  try {
    await os.run(null as any);
  } catch (e) {
    errorThrown = true;
  }
  assert(errorThrown, 'Empty request should throw error');

  // 5. Normal Run Execution
  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('posting-map')
    .build();

  const result = await os.run(context);
  assert(result !== undefined, 'Run should return a result');
  assert(os.health().state === AIOSState.READY, 'State should return to READY after execution');

  // 6. Version and Health
  const ver = os.version();
  assert(ver.aiosVersion === '1.0.0', 'Version should match');
  
  const health = os.health();
  assert(health.bootTime !== '', 'Boot time should be set');
  assert(health.activeSessions === 0, 'Active sessions should be 0');

  // 7. Shutdown
  await os.shutdown();
  assert(os.health().state === AIOSState.SHUTDOWN, 'State should be SHUTDOWN');

  console.log('All DevelopmentOS tests passed!');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
