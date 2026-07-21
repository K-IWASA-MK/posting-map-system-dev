import { AIWorkforceExecutionResponse } from '../../../aios/workforce/AIWorkforceExecutionResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponseStructure() {
  console.log('[Test] AIWorkforceExecutionResponse structural properties starting...');

  const response: AIWorkforceExecutionResponse = {
    execution: {
      executionId: "exec-resp-01",
      context: {
        runtimeId: "rt-resp-1",
        assignmentId: "asg-resp-1",
        employeeId: "emp-resp-1",
        roleId: "role-resp-1"
      },
      version: 1
    }
  };

  assert(response.execution.executionId === "exec-resp-01", "executionId mismatch");
  assert(response.execution.context.runtimeId === "rt-resp-1", "runtimeId mismatch");

  console.log('   ✓ AIWorkforceExecutionResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-8: AIWorkforceExecutionResponse Unit Tests ---');
  await testResponseStructure();
  console.log('--- All G9-8: AIWorkforceExecutionResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
