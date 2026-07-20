import { AIEmployeeResponse } from '../../../aios/workforce/AIEmployeeResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponseStructure() {
  console.log('[Test] AIEmployeeResponse structural properties starting...');

  const response: AIEmployeeResponse = {
    employee: {
      employeeId: "emp-303",
      profile: {
        employeeName: "David",
        departmentId: "dept-hr",
        roleId: "role-recruiter"
      },
      capability: {
        skills: ["sourcing"],
        certifications: [],
        executionTypes: ["recruiting"]
      },
      status: {
        state: "OFFLINE",
        availability: "NONE"
      }
    }
  };

  assert(response.employee.employeeId === "emp-303", "employeeId mismatch");
  assert(response.employee.profile.employeeName === "David", "employeeName mismatch");

  console.log('   ✓ AIEmployeeResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-1: AIEmployeeResponse Unit Tests ---');
  await testResponseStructure();
  console.log('--- All G9-1: AIEmployeeResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
