import { ExecutionPipelinePlan } from '../../../aios/execution/ExecutionPipelinePlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionPipelinePlanStructure() {
  console.log('[Test] ExecutionPipelinePlan properties starting...');

  const plan: ExecutionPipelinePlan = {
    pipelineId: "pipeline-123",
    executionId: "exec-456",
    stages: ["stage-validate", "stage-dispatch"]
  };

  assert(plan.pipelineId === "pipeline-123", "pipelineId mismatch");
  assert(plan.executionId === "exec-456", "executionId mismatch");
  assert(plan.stages.length === 2, "stages length mismatch");
  assert(plan.stages[0] === "stage-validate", "stage index 0 mismatch");
  assert(plan.stages[1] === "stage-dispatch", "stage index 1 mismatch");

  console.log('   ✓ ExecutionPipelinePlan properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-5: ExecutionPipelinePlan Unit Tests ---');
  await testExecutionPipelinePlanStructure();
  console.log('--- All G8-5: ExecutionPipelinePlan Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
