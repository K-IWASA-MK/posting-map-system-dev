import { AIWorkforceRuntime } from '../../../aios/workforce/AIWorkforceRuntime';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRuntimeStructure() {
  console.log('[Test] AIWorkforceRuntime structural properties starting...');

  const runtime: AIWorkforceRuntime = {
    runtimeId: "rt-wf-001",
    context: {
      employeeId: "emp-dev-01",
      roleId: "role-backend",
      assignmentId: "asg-001"
    },
    version: 1,
    metadata: { isMock: true }
  };

  assert(runtime.runtimeId === "rt-wf-001", "runtimeId mismatch");
  assert(runtime.context.employeeId === "emp-dev-01", "context employeeId mismatch");
  assert(runtime.version === 1, "version mismatch");

  console.log('   ✓ AIWorkforceRuntime structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-7: AIWorkforceRuntime Unit Tests ---');
  await testRuntimeStructure();
  console.log('--- All G9-7: AIWorkforceRuntime Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
