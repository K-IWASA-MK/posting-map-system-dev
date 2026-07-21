import { AIDepartmentProvider } from '../../../aios/workforce/AIDepartmentProvider';
import { AIDepartmentRequest } from '../../../aios/workforce/AIDepartmentRequest';
import { AIDepartmentResponse } from '../../../aios/workforce/AIDepartmentResponse';
import { AIDepartment } from '../../../aios/workforce/AIDepartment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIDepartmentProvider implements AIDepartmentProvider {
  private static departmentsMap = new Map<string, AIDepartment>();

  public registerDepartment(request: AIDepartmentRequest): AIDepartmentResponse {
    MockAIDepartmentProvider.departmentsMap.set(request.department.departmentId, request.department);
    return {
      department: request.department
    };
  }

  public getDepartment(departmentId: string): AIDepartmentResponse {
    const dept = MockAIDepartmentProvider.departmentsMap.get(departmentId);
    if (!dept) {
      throw new Error(`Department not found: ${departmentId}`);
    }
    return { department: dept };
  }

  public listDepartments(): readonly AIDepartment[] {
    return Array.from(MockAIDepartmentProvider.departmentsMap.values());
  }

  public clear() {
    MockAIDepartmentProvider.departmentsMap.clear();
  }
}

async function testMockDepartmentProviderFlow() {
  console.log('[Test] MockAIDepartmentProvider normal resolution starting...');

  const provider = new MockAIDepartmentProvider();
  provider.clear();

  const dept: AIDepartment = {
    departmentId: "dept-sec-01",
    profile: {
      departmentName: "Security",
      departmentType: "GOVERNANCE",
      description: "Platform and Cyber Security"
    },
    members: [{ employeeId: "emp-sec-1", roleId: "role-security-officer" }],
    version: 1
  };

  const registerResp = provider.registerDepartment({ department: dept });
  assert(registerResp.department.departmentId === "dept-sec-01", "register mismatch");

  const getResp = provider.getDepartment("dept-sec-01");
  assert(getResp.department.profile.departmentName === "Security", "get mismatch");

  const list = provider.listDepartments();
  assert(list.length === 1, "list length mismatch");
  assert(list[0].departmentId === "dept-sec-01", "list content mismatch");

  console.log('   ✓ MockAIDepartmentProvider normal resolution: PASSED');
}

async function testMockDepartmentProviderDeterministic() {
  console.log('[Test] MockAIDepartmentProvider boundary conditions starting...');

  const provider = new MockAIDepartmentProvider();
  provider.clear();

  const dept: AIDepartment = {
    departmentId: "dept-sec-01",
    profile: {
      departmentName: "Security",
      departmentType: "GOVERNANCE",
      description: "Platform and Cyber Security"
    },
    members: [{ employeeId: "emp-sec-1", roleId: "role-security-officer" }],
    version: 1
  };

  provider.registerDepartment({ department: dept });

  const resp1 = provider.getDepartment("dept-sec-01");
  const resp2 = provider.getDepartment("dept-sec-01");

  assert(JSON.stringify(resp1) === JSON.stringify(resp2), "Deterministic response mismatch");

  console.log('   ✓ MockAIDepartmentProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-3: AIDepartmentProvider Unit Tests ---');
  await testMockDepartmentProviderFlow();
  await testMockDepartmentProviderDeterministic();
  console.log('--- All G9-3: AIDepartmentProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
