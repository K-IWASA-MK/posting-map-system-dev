import { AIEmployeeProvider } from '../../../aios/workforce/AIEmployeeProvider';
import { AIEmployeeRequest } from '../../../aios/workforce/AIEmployeeRequest';
import { AIEmployeeResponse } from '../../../aios/workforce/AIEmployeeResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIEmployeeProvider implements AIEmployeeProvider {
  public registerEmployee(request: AIEmployeeRequest): AIEmployeeResponse {
    // Deterministic response based on request input, no side effects
    return {
      employee: request.employee
    };
  }
}

async function testMockProviderRegistration() {
  console.log('[Test] MockAIEmployeeProvider normal resolution starting...');

  const provider = new MockAIEmployeeProvider();
  const request: AIEmployeeRequest = {
    employee: {
      employeeId: "emp-999",
      profile: {
        employeeName: "Eve",
        departmentId: "dept-security",
        roleId: "role-analyst"
      },
      capability: {
        skills: ["incident-response"],
        certifications: ["cissp"],
        executionTypes: ["security"]
      },
      status: {
        state: "TRAINING",
        availability: "LOW"
      }
    }
  };

  const response = provider.registerEmployee(request);
  assert(response.employee.employeeId === "emp-999", "employeeId mismatch");
  assert(response.employee.profile.employeeName === "Eve", "employeeName mismatch");
  assert(response.employee.capability.skills[0] === "incident-response", "skill mismatch");
  assert(response.employee.status.state === "TRAINING", "state mismatch");

  console.log('   ✓ MockAIEmployeeProvider normal resolution: PASSED');
}

async function testMockProviderDeterministic() {
  console.log('[Test] MockAIEmployeeProvider boundary conditions starting...');

  const provider = new MockAIEmployeeProvider();
  const request: AIEmployeeRequest = {
    employee: {
      employeeId: "emp-999",
      profile: {
        employeeName: "Eve",
        departmentId: "dept-security",
        roleId: "role-analyst"
      },
      capability: {
        skills: ["incident-response"],
        certifications: ["cissp"],
        executionTypes: ["security"]
      },
      status: {
        state: "TRAINING",
        availability: "LOW"
      }
    }
  };

  const response1 = provider.registerEmployee(request);
  const response2 = provider.registerEmployee(request);

  // Assert deterministic registration outputs are identical
  assert(JSON.stringify(response1) === JSON.stringify(response2), "Deterministic registration failure");

  console.log('   ✓ MockAIEmployeeProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-1: AIEmployeeProvider Unit Tests ---');
  await testMockProviderRegistration();
  await testMockProviderDeterministic();
  console.log('--- All G9-1: AIEmployeeProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
