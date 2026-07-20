import { ExecutionResultSummary } from '../../../aios/execution/ExecutionResultSummary';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionResultSummaryStructure() {
  console.log('[Test] ExecutionResultSummary properties starting...');

  const summary: ExecutionResultSummary = {
    completedStages: 3,
    totalStages: 5
  };

  assert(summary.completedStages === 3, "completedStages mismatch");
  assert(summary.totalStages === 5, "totalStages mismatch");

  console.log('   ✓ ExecutionResultSummary properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-6: ExecutionResultSummary Unit Tests ---');
  await testExecutionResultSummaryStructure();
  console.log('--- All G8-6: ExecutionResultSummary Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
