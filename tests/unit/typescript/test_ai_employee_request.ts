import { AIEmployeeRequest } from '../../../aios/workforce/AIEmployeeRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRequestStructure() {
  console.log('[Test] AIEmployeeRequest structural properties starting...');

  const request: AIEmployeeRequest = {
    employee: {
      employeeId: "emp-202",
      profile: {
        employeeName: "Charlie",
        departmentId: "dept-sales",
        roleId: "role-representative"
      },
      capability: {
        skills: ["negotiation"],
        certifications: [],
        executionTypes: ["sales"]
      },
      status: {
        state: "ACTIVE",
        availability: "HIGH"
      }
    }
  };

  assert(request.employee.employeeId === "emp-202", "employeeId mismatch");
  assert(request.employee.profile.employeeName === "Charlie", "employeeName mismatch");

  console.log('   ✓ AIEmployeeRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-1: AIEmployeeRequest Unit Tests ---');
  await testRequestStructure();
  console.log('--- All G9-1: AIEmployeeRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
