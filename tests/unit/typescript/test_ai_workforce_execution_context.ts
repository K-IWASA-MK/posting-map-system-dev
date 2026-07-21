import { AIWorkforceExecutionContext } from '../../../aios/workforce/AIWorkforceExecutionContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionContextStructure() {
  console.log('[Test] AIWorkforceExecutionContext structural properties starting...');

  const context: AIWorkforceExecutionContext = {
    runtimeId: "rt-001",
    assignmentId: "asg-001",
    employeeId: "emp-sec-01",
    roleId: "role-sec-auditor",
    organizationId: "org-global-01",
    departmentId: "dept-sec-01",
    metadata: { traceId: "tr-12345" }
  };

  assert(context.runtimeId === "rt-001", "runtimeId mismatch");
  assert(context.assignmentId === "asg-001", "assignmentId mismatch");
  assert(context.employeeId === "emp-sec-01", "employeeId mismatch");
  assert(context.roleId === "role-sec-auditor", "roleId mismatch");
  assert(context.organizationId === "org-global-01", "organizationId mismatch");
  assert(context.departmentId === "dept-sec-01", "departmentId mismatch");
  assert((context.metadata as any).traceId === "tr-12345", "metadata mismatch");

  console.log('   ✓ AIWorkforceExecutionContext structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-8: AIWorkforceExecutionContext Unit Tests ---');
  await testExecutionContextStructure();
  console.log('--- All G9-8: AIWorkforceExecutionContext Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
