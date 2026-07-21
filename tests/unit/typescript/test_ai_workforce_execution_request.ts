import { AIWorkforceExecutionRequest } from '../../../aios/workforce/AIWorkforceExecutionRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRequestStructure() {
  console.log('[Test] AIWorkforceExecutionRequest structural properties starting...');

  const request: AIWorkforceExecutionRequest = {
    execution: {
      executionId: "exec-req-01",
      context: {
        runtimeId: "rt-req-1",
        assignmentId: "asg-req-1",
        employeeId: "emp-req-1",
        roleId: "role-req-1"
      },
      version: 1
    }
  };

  assert(request.execution.executionId === "exec-req-01", "executionId mismatch");
  assert(request.execution.context.runtimeId === "rt-req-1", "runtimeId mismatch");

  console.log('   ✓ AIWorkforceExecutionRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-8: AIWorkforceExecutionRequest Unit Tests ---');
  await testRequestStructure();
  console.log('--- All G9-8: AIWorkforceExecutionRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
