import { AIOrganizationProvider } from '../../../aios/workforce/AIOrganizationProvider';
import { AIOrganizationRequest } from '../../../aios/workforce/AIOrganizationRequest';
import { AIOrganizationResponse } from '../../../aios/workforce/AIOrganizationResponse';
import { AIOrganization } from '../../../aios/workforce/AIOrganization';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIOrganizationProvider implements AIOrganizationProvider {
  private static organizationsMap = new Map<string, AIOrganization>();

  public registerOrganization(request: AIOrganizationRequest): AIOrganizationResponse {
    MockAIOrganizationProvider.organizationsMap.set(request.organization.organizationId, request.organization);
    return {
      organization: request.organization
    };
  }

  public getOrganization(organizationId: string): AIOrganizationResponse {
    const org = MockAIOrganizationProvider.organizationsMap.get(organizationId);
    if (!org) {
      throw new Error(`Organization not found: ${organizationId}`);
    }
    return { organization: org };
  }

  public listOrganizations(): readonly AIOrganization[] {
    return Array.from(MockAIOrganizationProvider.organizationsMap.values());
  }

  public clear() {
    MockAIOrganizationProvider.organizationsMap.clear();
  }
}

async function testMockOrganizationProviderFlow() {
  console.log('[Test] MockAIOrganizationProvider normal resolution starting...');

  const provider = new MockAIOrganizationProvider();
  provider.clear();

  const org: AIOrganization = {
    organizationId: "org-001",
    profile: {
      organizationName: "Enterprise AI",
      organizationType: "MAIN",
      description: "Primary enterprise organization"
    },
    departments: [{ departmentId: "dept-eng-01" }],
    version: 1
  };

  const regResp = provider.registerOrganization({ organization: org });
  assert(regResp.organization.organizationId === "org-001", "register mismatch");

  const getResp = provider.getOrganization("org-001");
  assert(getResp.organization.profile.organizationName === "Enterprise AI", "get mismatch");

  const list = provider.listOrganizations();
  assert(list.length === 1, "list length mismatch");
  assert(list[0].organizationId === "org-001", "list content mismatch");

  console.log('   ✓ MockAIOrganizationProvider normal resolution: PASSED');
}

async function testMockOrganizationProviderDeterministic() {
  console.log('[Test] MockAIOrganizationProvider boundary conditions starting...');

  const provider = new MockAIOrganizationProvider();
  provider.clear();

  const org: AIOrganization = {
    organizationId: "org-001",
    profile: {
      organizationName: "Enterprise AI",
      organizationType: "MAIN",
      description: "Primary enterprise organization"
    },
    departments: [{ departmentId: "dept-eng-01" }],
    version: 1
  };

  provider.registerOrganization({ organization: org });

  const resp1 = provider.getOrganization("org-001");
  const resp2 = provider.getOrganization("org-001");

  assert(JSON.stringify(resp1) === JSON.stringify(resp2), "Deterministic response mismatch");

  console.log('   ✓ MockAIOrganizationProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-4: AIOrganizationProvider Unit Tests ---');
  await testMockOrganizationProviderFlow();
  await testMockOrganizationProviderDeterministic();
  console.log('--- All G9-4: AIOrganizationProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
