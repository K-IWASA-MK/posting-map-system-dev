import { ExecutionPipelineResult } from '../../../aios/execution/ExecutionPipelineResult';
import { ExecutionPipelinePlan } from '../../../aios/execution/ExecutionPipelinePlan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionPipelineResultStructure() {
  console.log('[Test] ExecutionPipelineResult properties starting...');

  const pipelinePlan: ExecutionPipelinePlan = {
    pipelineId: "pipeline-123",
    executionId: "exec-456",
    stages: ["stage-run"]
  };

  const result: ExecutionPipelineResult = {
    pipelinePlan
  };

  assert(result.pipelinePlan.pipelineId === "pipeline-123", "pipelineId mismatch");
  assert(result.pipelinePlan.executionId === "exec-456", "executionId mismatch");

  console.log('   ✓ ExecutionPipelineResult properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-5: ExecutionPipelineResult Unit Tests ---');
  await testExecutionPipelineResultStructure();
  console.log('--- All G8-5: ExecutionPipelineResult Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
