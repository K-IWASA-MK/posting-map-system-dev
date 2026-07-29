import assert from 'assert';
import { ExecutionPipeline } from '../../../sdk/pipeline/ExecutionPipeline';
import { ExecutionDispatcher } from '../../../sdk/dispatcher/ExecutionDispatcher';
import { ExecutionRuntime } from '../../../sdk/runtime/ExecutionRuntime';
import { RuntimeRegistry } from '../../../sdk/runtime/RuntimeRegistry';
import { LegacyRuntime } from '../../../sdk/runtime/runtimes/LegacyRuntime';
import { NativeRuntime } from '../../../sdk/runtime/runtimes/NativeRuntime';
import { ExecutionResultAdapter } from '../../../sdk/results/ExecutionResultAdapter';
import { TaskContract } from '../../../sdk/gateway/models/TaskContractModels';

function createMockContract(intent: any, metadata: any): TaskContract {
  return {
    taskId: 'TASK-4000',
    intent,
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
      metadata
    }
  };
}

async function testSuccessfulPipelineExecution() {
  console.log('[Test 1] ExecutionPipeline End-to-End Success Verification...');

  // Setup Dependencies
  const registry = new RuntimeRegistry([new LegacyRuntime(), new NativeRuntime()]);
  const runtime = new ExecutionRuntime(registry);
  const resultAdapter = new ExecutionResultAdapter();

  // Instantiate Pipeline
  const pipeline = new ExecutionPipeline(ExecutionDispatcher, runtime, resultAdapter);

  // Execute Legacy Task
  const contract = createMockContract('IMPLEMENTATION', { legacyOperation: 'submitDistribution' });
  const pipelineResult = await pipeline.execute(contract);

  // Assertions
  assert(pipelineResult !== undefined, 'PipelineResult should be returned');
  assert(pipelineResult.taskResult !== undefined, 'TaskResult should be included');
  assert(pipelineResult.taskResult.taskId === 'TASK-4000', 'Task ID should propagate correctly');
  assert(pipelineResult.taskResult.status === 'SUCCESS', 'Status should be normalized to SUCCESS');
  assert(pipelineResult.taskResult.metadata.adapterUsed === 'LEGACY_CONTRACT_ADAPTER', 'Metadata should be propagated');
  assert(Object.isFrozen(pipelineResult), 'PipelineResult should be immutable');

  console.log('   ✓ Pipeline E2E Execution: PASSED');
}

async function testPipelineErrorPropagation() {
  console.log('[Test 2] ExecutionPipeline Error Propagation Verification...');

  const registry = new RuntimeRegistry([new NativeRuntime()]); // Legacy missing intentionally
  const runtime = new ExecutionRuntime(registry);
  const resultAdapter = new ExecutionResultAdapter();
  const pipeline = new ExecutionPipeline(ExecutionDispatcher, runtime, resultAdapter);

  const contract = createMockContract('IMPLEMENTATION', { legacyOperation: 'submitDistribution' });

  try {
    await pipeline.execute(contract);
    assert.fail('Should have thrown an exception');
  } catch (err: any) {
    assert(err.message.includes('No registered runtime supports the runtimeType: LEGACY_RUNTIME'), 
      'Unexpected error message: ' + err.message);
  }

  console.log('   ✓ Error Propagation Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Execution Pipeline Foundation Unit Tests ---');
  await testSuccessfulPipelineExecution();
  await testPipelineErrorPropagation();
  console.log('--- All Execution Pipeline Foundation Unit Tests PASSED ---');
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Test Suite Error:', err);
    process.exit(1);
  });
}
