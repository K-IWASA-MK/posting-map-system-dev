import { AIEmployeeRegistryProvider } from '../../../aios/workforce/AIEmployeeRegistryProvider';
import { AIEmployeeRegistry } from '../../../aios/workforce/AIEmployeeRegistry';
import { AIEmployeeRegistration } from '../../../aios/workforce/AIEmployeeRegistration';
import { AIEmployeeLookupRequest } from '../../../aios/workforce/AIEmployeeLookupRequest';
import { AIEmployeeLookupResponse } from '../../../aios/workforce/AIEmployeeLookupResponse';
import { AIEmployee } from '../../../aios/workforce/AIEmployee';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIEmployeeRegistryProvider implements AIEmployeeRegistryProvider {
  private static mockEmployees: AIEmployee[] = [];

  public register(registration: AIEmployeeRegistration): AIEmployeeRegistry {
    const list = [...MockAIEmployeeRegistryProvider.mockEmployees, registration.employee];
    MockAIEmployeeRegistryProvider.mockEmployees = list;
    return {
      registryId: "mock-registry-id",
      employees: list,
      version: list.length,
      metadata: {}
    };
  }

  public lookup(request: AIEmployeeLookupRequest): AIEmployeeLookupResponse {
    let list = MockAIEmployeeRegistryProvider.mockEmployees;
    if (request.employeeId) {
      list = list.filter(e => e.employeeId === request.employeeId);
    }
    if (request.capability) {
      list = list.filter(e => e.capability.skills.includes(request.capability!) || e.capability.executionTypes.includes(request.capability!));
    }
    if (request.roleId) {
      list = list.filter(e => e.profile.roleId === request.roleId);
    }
    if (request.departmentId) {
      list = list.filter(e => e.profile.departmentId === request.departmentId);
    }
    return {
      employees: list,
      totalCount: list.length,
      metadata: {}
    };
  }

  public list(): AIEmployeeRegistry {
    return {
      registryId: "mock-registry-id",
      employees: MockAIEmployeeRegistryProvider.mockEmployees,
      version: MockAIEmployeeRegistryProvider.mockEmployees.length,
      metadata: {}
    };
  }

  public clear() {
    MockAIEmployeeRegistryProvider.mockEmployees = [];
  }
}

async function testMockProviderFlow() {
  console.log('[Test] MockAIEmployeeRegistryProvider normal resolution starting...');

  const provider = new MockAIEmployeeProvider();
  provider.clear();

  const employee: AIEmployee = {
    employeeId: "emp-test",
    profile: {
      employeeName: "Tester",
      departmentId: "dept-test",
      roleId: "role-tester"
    },
    capability: {
      skills: ["testing"],
      certifications: [],
      executionTypes: ["qa"]
    },
    status: {
      state: "IDLE",
      availability: "HIGH"
    }
  };

  const registration: AIEmployeeRegistration = {
    registrationId: "reg-1",
    employee,
    timestamp: "2026-07-21T00:00:00Z",
    metadata: {}
  };

  const registry = provider.register(registration);
  assert(registry.employees.length === 1, "Expected registry to have 1 employee");
  assert(registry.employees[0].employeeId === "emp-test", "Employee ID mismatch");

  // Lookup
  const lookupResponse = provider.lookup({ capability: "testing" });
  assert(lookupResponse.employees.length === 1, "Expected lookup to return 1 employee");
  assert(lookupResponse.employees[0].employeeId === "emp-test", "Employee ID mismatch on lookup");

  const emptyLookup = provider.lookup({ capability: "non-existent" });
  assert(emptyLookup.employees.length === 0, "Expected empty lookup");

  console.log('   ✓ MockAIEmployeeRegistryProvider normal resolution: PASSED');
}

async function testMockProviderDeterministic() {
  console.log('[Test] MockAIEmployeeRegistryProvider boundary conditions starting...');

  const provider = new MockAIEmployeeProvider();
  provider.clear();

  const request: AIEmployeeLookupRequest = { capability: "testing" };
  const res1 = provider.lookup(request);
  const res2 = provider.lookup(request);

  assert(JSON.stringify(res1) === JSON.stringify(res2), "Deterministic lookup failure");

  console.log('   ✓ MockAIEmployeeRegistryProvider boundary conditions: PASSED');
}

const MockAIEmployeeProvider = MockAIEmployeeRegistryProvider;

async function runAll() {
  console.log('--- Starting G9-2: AIEmployeeRegistryProvider Unit Tests ---');
  await testMockProviderFlow();
  await testMockProviderDeterministic();
  console.log('--- All G9-2: AIEmployeeRegistryProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
