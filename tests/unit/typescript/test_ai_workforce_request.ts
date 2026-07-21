import { AIWorkforceRequest } from '../../../aios/workforce/AIWorkforceRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRequestStructure() {
  console.log('[Test] AIWorkforceRequest structural properties starting...');

  const request: AIWorkforceRequest = {
    runtime: {
      runtimeId: "rt-req-01",
      context: {
        employeeId: "emp-req-1",
        roleId: "role-req-1",
        assignmentId: "asg-req-1"
      },
      version: 1
    }
  };

  assert(request.runtime.runtimeId === "rt-req-01", "runtimeId mismatch");
  assert(request.runtime.context.employeeId === "emp-req-1", "employeeId mismatch");

  console.log('   ✓ AIWorkforceRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-7: AIWorkforceRequest Unit Tests ---');
  await testRequestStructure();
  console.log('--- All G9-7: AIWorkforceRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
