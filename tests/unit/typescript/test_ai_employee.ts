import { AIEmployee } from '../../../aios/workforce/AIEmployee';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testEmployeeStructure() {
  console.log('[Test] AIEmployee structural properties starting...');

  const employee: AIEmployee = {
    employeeId: "emp-101",
    profile: {
      employeeName: "Bob",
      departmentId: "dept-ops",
      roleId: "role-operator"
    },
    capability: {
      skills: ["deployment", "automation"],
      certifications: [],
      executionTypes: ["ops"]
    },
    status: {
      state: "IDLE",
      availability: "MEDIUM"
    }
  };

  assert(employee.employeeId === "emp-101", "employeeId mismatch");
  assert(employee.profile.employeeName === "Bob", "profile name mismatch");
  assert(employee.capability.skills[0] === "deployment", "capability skill mismatch");
  assert(employee.status.state === "IDLE", "status state mismatch");

  console.log('   ✓ AIEmployee structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-1: AIEmployee Unit Tests ---');
  await testEmployeeStructure();
  console.log('--- All G9-1: AIEmployee Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
