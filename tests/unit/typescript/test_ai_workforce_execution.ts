import { AIWorkforceExecution } from '../../../aios/workforce/AIWorkforceExecution';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionStructure() {
  console.log('[Test] AIWorkforceExecution structural properties starting...');

  const execution: AIWorkforceExecution = {
    executionId: "exec-wf-001",
    context: {
      runtimeId: "rt-001",
      assignmentId: "asg-001",
      employeeId: "emp-dev-01",
      roleId: "role-backend"
    },
    version: 1,
    metadata: { priority: "HIGH" }
  };

  assert(execution.executionId === "exec-wf-001", "executionId mismatch");
  assert(execution.context.runtimeId === "rt-001", "context runtimeId mismatch");
  assert(execution.version === 1, "version mismatch");

  console.log('   ✓ AIWorkforceExecution structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-8: AIWorkforceExecution Unit Tests ---');
  await testExecutionStructure();
  console.log('--- All G9-8: AIWorkforceExecution Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
