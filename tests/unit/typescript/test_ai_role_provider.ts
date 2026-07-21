import { AIRoleProvider } from '../../../aios/workforce/AIRoleProvider';
import { AIRoleRequest } from '../../../aios/workforce/AIRoleRequest';
import { AIRoleResponse } from '../../../aios/workforce/AIRoleResponse';
import { AIRole } from '../../../aios/workforce/AIRole';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIRoleProvider implements AIRoleProvider {
  private static rolesMap = new Map<string, AIRole>();

  public registerRole(request: AIRoleRequest): AIRoleResponse {
    MockAIRoleProvider.rolesMap.set(request.role.roleId, request.role);
    return {
      role: request.role
    };
  }

  public getRole(roleId: string): AIRoleResponse {
    const role = MockAIRoleProvider.rolesMap.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }
    return { role };
  }

  public listRoles(): readonly AIRole[] {
    return Array.from(MockAIRoleProvider.rolesMap.values());
  }

  public clear() {
    MockAIRoleProvider.rolesMap.clear();
  }
}

async function testMockRoleProviderFlow() {
  console.log('[Test] MockAIRoleProvider normal resolution starting...');

  const provider = new MockAIRoleProvider();
  provider.clear();

  const role: AIRole = {
    roleId: "role-001",
    profile: {
      roleName: "Architect",
      roleType: "LEAD",
      description: "Architecture design and review"
    },
    responsibilities: [{ responsibilityId: "resp-arch-01", responsibilityName: "Architecture Governance" }],
    version: 1
  };

  const regResp = provider.registerRole({ role });
  assert(regResp.role.roleId === "role-001", "register mismatch");

  const getResp = provider.getRole("role-001");
  assert(getResp.role.profile.roleName === "Architect", "get mismatch");

  const list = provider.listRoles();
  assert(list.length === 1, "list length mismatch");
  assert(list[0].roleId === "role-001", "list content mismatch");

  console.log('   ✓ MockAIRoleProvider normal resolution: PASSED');
}

async function testMockRoleProviderDeterministic() {
  console.log('[Test] MockAIRoleProvider boundary conditions starting...');

  const provider = new MockAIRoleProvider();
  provider.clear();

  const role: AIRole = {
    roleId: "role-001",
    profile: {
      roleName: "Architect",
      roleType: "LEAD",
      description: "Architecture design and review"
    },
    responsibilities: [{ responsibilityId: "resp-arch-01", responsibilityName: "Architecture Governance" }],
    version: 1
  };

  provider.registerRole({ role });

  const resp1 = provider.getRole("role-001");
  const resp2 = provider.getRole("role-001");

  assert(JSON.stringify(resp1) === JSON.stringify(resp2), "Deterministic response mismatch");

  console.log('   ✓ MockAIRoleProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-5: AIRoleProvider Unit Tests ---');
  await testMockRoleProviderFlow();
  await testMockRoleProviderDeterministic();
  console.log('--- All G9-5: AIRoleProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
