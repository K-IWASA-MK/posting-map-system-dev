import { AIWorkforceResponse } from '../../../aios/workforce/AIWorkforceResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponseStructure() {
  console.log('[Test] AIWorkforceResponse structural properties starting...');

  const response: AIWorkforceResponse = {
    runtime: {
      runtimeId: "rt-resp-01",
      context: {
        employeeId: "emp-resp-1",
        roleId: "role-resp-1",
        assignmentId: "asg-resp-1"
      },
      version: 1
    }
  };

  assert(response.runtime.runtimeId === "rt-resp-01", "runtimeId mismatch");
  assert(response.runtime.context.employeeId === "emp-resp-1", "employeeId mismatch");

  console.log('   ✓ AIWorkforceResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-7: AIWorkforceResponse Unit Tests ---');
  await testResponseStructure();
  console.log('--- All G9-7: AIWorkforceResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
