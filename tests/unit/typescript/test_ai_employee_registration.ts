import { AIEmployeeRegistration } from '../../../aios/workforce/AIEmployeeRegistration';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRegistrationStructure() {
  console.log('[Test] AIEmployeeRegistration structural properties starting...');

  const registration: AIEmployeeRegistration = {
    registrationId: "tx-777",
    employee: {
      employeeId: "emp-abc",
      profile: {
        employeeName: "Frank",
        departmentId: "dept-sales",
        roleId: "role-analyst"
      },
      capability: {
        skills: ["forecasting"],
        certifications: [],
        executionTypes: ["sales"]
      },
      status: {
        state: "IDLE",
        availability: "HIGH"
      }
    },
    timestamp: "2026-07-21T00:00:00Z",
    metadata: { source: "admin-console" }
  };

  assert(registration.registrationId === "tx-777", "registrationId mismatch");
  assert(registration.employee.employeeId === "emp-abc", "employeeId mismatch");
  assert(registration.timestamp === "2026-07-21T00:00:00Z", "timestamp mismatch");
  assert((registration.metadata as any).source === "admin-console", "metadata mismatch");

  console.log('   ✓ AIEmployeeRegistration structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-2: AIEmployeeRegistration Unit Tests ---');
  await testRegistrationStructure();
  console.log('--- All G9-2: AIEmployeeRegistration Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
