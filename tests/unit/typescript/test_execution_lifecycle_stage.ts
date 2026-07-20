import { ExecutionLifecycleStage } from '../../../aios/execution/ExecutionLifecycleStage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionLifecycleStageStructure() {
  console.log('[Test] ExecutionLifecycleStage properties starting...');

  const stage: ExecutionLifecycleStage = {
    currentStage: "execution-planning",
    availableStages: ["scheduler-resolution", "execution-planning", "orchestration-setup", "running", "completed"]
  };

  assert(stage.currentStage === "execution-planning", "currentStage mismatch");
  assert(stage.availableStages.length === 5, "availableStages length mismatch");
  assert(stage.availableStages[1] === "execution-planning", "availableStages element mismatch");

  console.log('   ✓ ExecutionLifecycleStage properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G8-8: ExecutionLifecycleStage Unit Tests ---');
  await testExecutionLifecycleStageStructure();
  console.log('--- All G8-8: ExecutionLifecycleStage Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
