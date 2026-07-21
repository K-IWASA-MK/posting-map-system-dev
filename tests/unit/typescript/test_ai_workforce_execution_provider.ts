import { AIWorkforceExecutionProvider } from '../../../aios/workforce/AIWorkforceExecutionProvider';
import { AIWorkforceExecutionRequest } from '../../../aios/workforce/AIWorkforceExecutionRequest';
import { AIWorkforceExecutionResponse } from '../../../aios/workforce/AIWorkforceExecutionResponse';
import { AIWorkforceExecution } from '../../../aios/workforce/AIWorkforceExecution';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIWorkforceExecutionProvider implements AIWorkforceExecutionProvider {
  private static executionsMap = new Map<string, AIWorkforceExecution>();

  public createExecution(request: AIWorkforceExecutionRequest): AIWorkforceExecutionResponse {
    MockAIWorkforceExecutionProvider.executionsMap.set(request.execution.executionId, request.execution);
    return {
      execution: request.execution
    };
  }

  public getExecution(executionId: string): AIWorkforceExecutionResponse {
    const exec = MockAIWorkforceExecutionProvider.executionsMap.get(executionId);
    if (!exec) {
      throw new Error(`Execution not found: ${executionId}`);
    }
    return { execution: exec };
  }

  public listExecutions(): readonly AIWorkforceExecution[] {
    return Array.from(MockAIWorkforceExecutionProvider.executionsMap.values());
  }

  public clear() {
    MockAIWorkforceExecutionProvider.executionsMap.clear();
  }
}

async function testMockExecutionProviderFlow() {
  console.log('[Test] MockAIWorkforceExecutionProvider normal resolution starting...');

  const provider = new MockAIWorkforceExecutionProvider();
  provider.clear();

  const execution: AIWorkforceExecution = {
    executionId: "exec-001",
    context: {
      runtimeId: "rt-001",
      assignmentId: "asg-001",
      employeeId: "emp-001",
      roleId: "role-001",
      organizationId: "org-001",
      departmentId: "dept-001"
    },
    version: 1
  };

  const createResp = provider.createExecution({ execution });
  assert(createResp.execution.executionId === "exec-001", "create mismatch");

  const getResp = provider.getExecution("exec-001");
  assert(getResp.execution.context.runtimeId === "rt-001", "get mismatch");

  const list = provider.listExecutions();
  assert(list.length === 1, "list length mismatch");
  assert(list[0].executionId === "exec-001", "list content mismatch");

  console.log('   ✓ MockAIWorkforceExecutionProvider normal resolution: PASSED');
}

async function testMockExecutionProviderDeterministic() {
  console.log('[Test] MockAIWorkforceExecutionProvider boundary conditions starting...');

  const provider = new MockAIWorkforceExecutionProvider();
  provider.clear();

  const execution: AIWorkforceExecution = {
    executionId: "exec-001",
    context: {
      runtimeId: "rt-001",
      assignmentId: "asg-001",
      employeeId: "emp-001",
      roleId: "role-001"
    },
    version: 1
  };

  provider.createExecution({ execution });

  const resp1 = provider.getExecution("exec-001");
  const resp2 = provider.getExecution("exec-001");

  assert(JSON.stringify(resp1) === JSON.stringify(resp2), "Deterministic response mismatch");

  console.log('   ✓ MockAIWorkforceExecutionProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-8: AIWorkforceExecutionProvider Unit Tests ---');
  await testMockExecutionProviderFlow();
  await testMockExecutionProviderDeterministic();
  console.log('--- All G9-8: AIWorkforceExecutionProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
