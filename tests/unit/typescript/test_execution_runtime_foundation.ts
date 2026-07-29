import assert from 'assert';
import { ExecutionRuntime } from '../../../sdk/runtime/ExecutionRuntime';
import { RuntimeRegistry } from '../../../sdk/runtime/RuntimeRegistry';
import { LegacyRuntime } from '../../../sdk/runtime/runtimes/LegacyRuntime';
import { NativeRuntime } from '../../../sdk/runtime/runtimes/NativeRuntime';
import { PluginRuntime } from '../../../sdk/runtime/runtimes/PluginRuntime';
import { DispatchDecision } from '../../../sdk/dispatcher/DispatchDecision';
import { TaskContract } from '../../../sdk/gateway/models/TaskContractModels';

function createMockContract(): TaskContract {
  return {
    taskId: 'TASK-2000',
    intent: 'IMPLEMENTATION',
    workflowProfile: {
      workflowType: 'STANDARD_DEVELOPMENT',
      stages: [],
      outputPolicy: { language: 'ja', codeLanguage: 'en', documentationLanguage: 'ja' },
      completionPolicy: {
        requireVerification: false,
        requireGitCommit: false,
        requireGitPush: false,
        requireWalkthrough: false,
        requireHandover: false
      }
    },
    workflowStages: [],
    priority: 'NORMAL',
    status: 'CONTRACT_GENERATED',
    outputLanguage: 'JA',
    outputPolicy: {
      primaryLanguage: 'JA',
      allowEnglishTechnicalTerms: true,
      rules: [],
      specificationVersion: '1.0'
    },
    createdAt: new Date().toISOString(),
    definitionOfDone: [],
    ceoDecision: {
      ceoInput: 'dummy',
      timestamp: new Date().toISOString(),
      metadata: { legacyOperation: 'submitDistribution' }
    }
  };
}

async function testRuntimeRegistryAndExecution() {
  console.log('[Test 1] ExecutionRuntime & RuntimeRegistry Verification...');

  const registry = new RuntimeRegistry();
  registry.register(new NativeRuntime());
  registry.register(new PluginRuntime());
  registry.register(new LegacyRuntime()); // Should be ordered by priority internally (Legacy 100, Plugin 80, Native 50)

  // Verify Priority Ordering
  const runtimes = registry.getRegisteredRuntimes();
  assert(runtimes[0] instanceof LegacyRuntime, 'LegacyRuntime should be highest priority (100)');
  assert(runtimes[1] instanceof PluginRuntime, 'PluginRuntime should be second priority (80)');
  assert(runtimes[2] instanceof NativeRuntime, 'NativeRuntime should be lowest priority (50)');

  const runtime = new ExecutionRuntime(registry);

  const contract = createMockContract();
  const legacyDecision: DispatchDecision = {
    runtimeType: 'LEGACY_RUNTIME',
    adapterType: 'LEGACY_CONTRACT_ADAPTER',
    executionType: 'SYNCHRONOUS_API_CALL',
    priority: 'NORMAL',
    reason: 'Testing legacy'
  };

  const result = await runtime.execute(legacyDecision, contract, { legacyOperation: 'submitDistribution' });
  
  assert(result.status === 'SUCCESS', 'Legacy Runtime should succeed');
  assert(result.executionId.startsWith('EXEC-'), 'Execution ID should be generated');
  assert(result.metadata?.adapterUsed === 'LEGACY_CONTRACT_ADAPTER', 'Adapter type should be passed down');

  console.log('   ✓ RuntimeRegistry & Execution Verification: PASSED');
}

async function testUnsupportedRuntimeFallback() {
  console.log('[Test 2] ExecutionRuntime Unsupported Target Verification...');

  const registry = new RuntimeRegistry([new NativeRuntime()]);
  const runtime = new ExecutionRuntime(registry);

  const contract = createMockContract();
  const unknownDecision: DispatchDecision = {
    runtimeType: 'EXTERNAL_RUNTIME',
    adapterType: 'NONE',
    executionType: 'API',
    priority: 'NORMAL',
    reason: 'Testing unknown target'
  };

  try {
    await runtime.execute(unknownDecision, contract);
    assert.fail('Should throw error for unsupported runtime');
  } catch (err: any) {
    assert(err.message.includes('No registered runtime supports'), 'Unexpected error message: ' + err.message);
  }

  console.log('   ✓ Unsupported Target Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Execution Runtime Foundation Unit Tests ---');
  await testRuntimeRegistryAndExecution();
  await testUnsupportedRuntimeFallback();
  console.log('--- All Execution Runtime Foundation Unit Tests PASSED ---');
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Test Suite Error:', err);
    process.exit(1);
  });
}
