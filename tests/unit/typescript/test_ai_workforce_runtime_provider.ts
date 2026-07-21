import { AIWorkforceRuntimeProvider } from '../../../aios/workforce/AIWorkforceRuntimeProvider';
import { AIWorkforceRequest } from '../../../aios/workforce/AIWorkforceRequest';
import { AIWorkforceResponse } from '../../../aios/workforce/AIWorkforceResponse';
import { AIWorkforceRuntime } from '../../../aios/workforce/AIWorkforceRuntime';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIWorkforceRuntimeProvider implements AIWorkforceRuntimeProvider {
  private static runtimesMap = new Map<string, AIWorkforceRuntime>();

  public createRuntime(request: AIWorkforceRequest): AIWorkforceResponse {
    MockAIWorkforceRuntimeProvider.runtimesMap.set(request.runtime.runtimeId, request.runtime);
    return {
      runtime: request.runtime
    };
  }

  public getRuntime(runtimeId: string): AIWorkforceResponse {
    const rt = MockAIWorkforceRuntimeProvider.runtimesMap.get(runtimeId);
    if (!rt) {
      throw new Error(`Runtime not found: ${runtimeId}`);
    }
    return { runtime: rt };
  }

  public listRuntimes(): readonly AIWorkforceRuntime[] {
    return Array.from(MockAIWorkforceRuntimeProvider.runtimesMap.values());
  }

  public clear() {
    MockAIWorkforceRuntimeProvider.runtimesMap.clear();
  }
}

async function testMockRuntimeProviderFlow() {
  console.log('[Test] MockAIWorkforceRuntimeProvider normal resolution starting...');

  const provider = new MockAIWorkforceRuntimeProvider();
  provider.clear();

  const runtime: AIWorkforceRuntime = {
    runtimeId: "rt-001",
    context: {
      employeeId: "emp-001",
      roleId: "role-001",
      assignmentId: "asg-001",
      organizationId: "org-001",
      departmentId: "dept-001"
    },
    version: 1
  };

  const createResp = provider.createRuntime({ runtime });
  assert(createResp.runtime.runtimeId === "rt-001", "create mismatch");

  const getResp = provider.getRuntime("rt-001");
  assert(getResp.runtime.context.employeeId === "emp-001", "get mismatch");

  const list = provider.listRuntimes();
  assert(list.length === 1, "list length mismatch");
  assert(list[0].runtimeId === "rt-001", "list content mismatch");

  console.log('   ✓ MockAIWorkforceRuntimeProvider normal resolution: PASSED');
}

async function testMockRuntimeProviderDeterministic() {
  console.log('[Test] MockAIWorkforceRuntimeProvider boundary conditions starting...');

  const provider = new MockAIWorkforceRuntimeProvider();
  provider.clear();

  const runtime: AIWorkforceRuntime = {
    runtimeId: "rt-001",
    context: {
      employeeId: "emp-001",
      roleId: "role-001",
      assignmentId: "asg-001"
    },
    version: 1
  };

  provider.createRuntime({ runtime });

  const resp1 = provider.getRuntime("rt-001");
  const resp2 = provider.getRuntime("rt-001");

  assert(JSON.stringify(resp1) === JSON.stringify(resp2), "Deterministic response mismatch");

  console.log('   ✓ MockAIWorkforceRuntimeProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-7: AIWorkforceRuntimeProvider Unit Tests ---');
  await testMockRuntimeProviderFlow();
  await testMockRuntimeProviderDeterministic();
  console.log('--- All G9-7: AIWorkforceRuntimeProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
