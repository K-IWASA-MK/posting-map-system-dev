import { AIWorkforceContext } from '../../../aios/workforce/AIWorkforceContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testContextStructure() {
  console.log('[Test] AIWorkforceContext structural properties starting...');

  const context: AIWorkforceContext = {
    employeeId: "emp-qa-01",
    roleId: "role-qa-lead",
    assignmentId: "asg-daily-test",
    organizationId: "org-global-01",
    departmentId: "dept-qa-01",
    metadata: { env: "staging" }
  };

  assert(context.employeeId === "emp-qa-01", "employeeId mismatch");
  assert(context.roleId === "role-qa-lead", "roleId mismatch");
  assert(context.assignmentId === "asg-daily-test", "assignmentId mismatch");
  assert(context.organizationId === "org-global-01", "organizationId mismatch");
  assert(context.departmentId === "dept-qa-01", "departmentId mismatch");
  assert((context.metadata as any).env === "staging", "metadata mismatch");

  console.log('   ✓ AIWorkforceContext structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-7: AIWorkforceContext Unit Tests ---');
  await testContextStructure();
  console.log('--- All G9-7: AIWorkforceContext Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
