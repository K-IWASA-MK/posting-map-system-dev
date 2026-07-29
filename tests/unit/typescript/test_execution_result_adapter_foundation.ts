import assert from 'assert';
import { ExecutionResultAdapter } from '../../../sdk/results/ExecutionResultAdapter';
import { ExecutionResult } from '../../../sdk/runtime/ExecutionResult';
import { TaskStatus } from '../../../sdk/results/TaskStatus';

function createMockExecutionResult(overrides: Partial<ExecutionResult> = {}): ExecutionResult {
  return {
    taskId: 'TASK-3000',
    executionId: 'EXEC-12345',
    status: 'SUCCESS',
    startedAt: new Date('2026-07-29T00:00:00Z').toISOString(),
    completedAt: new Date('2026-07-29T00:00:10Z').toISOString(),
    duration: 10000,
    payload: { key: 'value' },
    metadata: {
      runtimeType: 'LEGACY_RUNTIME',
      adapterUsed: 'LEGACY_CONTRACT_ADAPTER'
    },
    ...overrides
  };
}

async function testSuccessfulConversion() {
  console.log('[Test 1] ExecutionResultAdapter Successful Conversion...');
  
  const adapter = new ExecutionResultAdapter();
  const execResult = createMockExecutionResult();
  
  const taskResult = adapter.convert(execResult);

  assert(taskResult.taskId === 'TASK-3000', 'Task ID should map correctly');
  assert(taskResult.executionId === 'EXEC-12345', 'Execution ID should map correctly');
  assert(taskResult.status === 'SUCCESS', 'Status should be SUCCESS');
  assert(taskResult.duration === 10000, 'Duration should be preserved');
  assert((taskResult.payload as any).key === 'value', 'Payload should be copied');
  assert(taskResult.metadata.runtimeType === 'LEGACY_RUNTIME', 'Metadata should be copied');
  assert(taskResult.metadata.version === '1.0', 'Version should default to 1.0 if not provided');
  assert(Object.isFrozen(taskResult), 'TaskResult must be immutable');
  assert(Object.isFrozen(taskResult.payload), 'Payload must be immutable');
  assert(Object.isFrozen(taskResult.metadata), 'Metadata must be immutable');

  console.log('   ✓ Successful Conversion: PASSED');
}

async function testFailureConversion() {
  console.log('[Test 2] ExecutionResultAdapter Error/Failure Conversion...');
  
  const adapter = new ExecutionResultAdapter();
  const execResult = createMockExecutionResult({
    status: 'FAILURE',
    error: 'Simulated exception'
  });
  
  const taskResult = adapter.convert(execResult);

  assert(taskResult.status === 'FAILED', 'Status FAILURE should map to FAILED');
  assert(taskResult.error !== undefined, 'Error should be mapped');
  assert(taskResult.error?.code === 'RUNTIME_EXECUTION_ERROR', 'Error code should be assigned');
  assert(taskResult.error?.message === 'Simulated exception', 'Error message should be copied');
  assert(taskResult.error?.retryable === false, 'Should default to not retryable');
  assert(Object.isFrozen(taskResult.error), 'Error must be immutable');

  console.log('   ✓ Error/Failure Conversion: PASSED');
}

async function testInvalidInput() {
  console.log('[Test 3] ExecutionResultAdapter Invalid Input Verification...');
  
  const adapter = new ExecutionResultAdapter();
  const execResult = createMockExecutionResult();
  // @ts-ignore: testing invalid input
  delete execResult.taskId;
  
  try {
    adapter.convert(execResult);
    assert.fail('Should have thrown an error for missing taskId');
  } catch (err: any) {
    assert(err.message.includes('missing taskId'), 'Unexpected error message: ' + err.message);
  }

  console.log('   ✓ Invalid Input Verification: PASSED');
}

async function runAll() {
  console.log('--- Starting Execution Result Adapter Foundation Unit Tests ---');
  await testSuccessfulConversion();
  await testFailureConversion();
  await testInvalidInput();
  console.log('--- All Execution Result Adapter Foundation Unit Tests PASSED ---');
}

if (require.main === module) {
  runAll().catch(err => {
    console.error('Test Suite Error:', err);
    process.exit(1);
  });
}
