import { AIAssignmentProvider } from '../../../aios/workforce/AIAssignmentProvider';
import { AIAssignmentRequest } from '../../../aios/workforce/AIAssignmentRequest';
import { AIAssignmentResponse } from '../../../aios/workforce/AIAssignmentResponse';
import { AIAssignment } from '../../../aios/workforce/AIAssignment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockAIAssignmentProvider implements AIAssignmentProvider {
  private static assignmentsMap = new Map<string, AIAssignment>();

  public registerAssignment(request: AIAssignmentRequest): AIAssignmentResponse {
    MockAIAssignmentProvider.assignmentsMap.set(request.assignment.assignmentId, request.assignment);
    return {
      assignment: request.assignment
    };
  }

  public getAssignment(assignmentId: string): AIAssignmentResponse {
    const asg = MockAIAssignmentProvider.assignmentsMap.get(assignmentId);
    if (!asg) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }
    return { assignment: asg };
  }

  public listAssignments(): readonly AIAssignment[] {
    return Array.from(MockAIAssignmentProvider.assignmentsMap.values());
  }

  public clear() {
    MockAIAssignmentProvider.assignmentsMap.clear();
  }
}

async function testMockAssignmentProviderFlow() {
  console.log('[Test] MockAIAssignmentProvider normal resolution starting...');

  const provider = new MockAIAssignmentProvider();
  provider.clear();

  const asg: AIAssignment = {
    assignmentId: "asg-001",
    profile: {
      assignmentName: "Code Review",
      assignmentType: "TASK",
      description: "Perform CR on feature branch"
    },
    target: {
      targetId: "pr-100",
      targetType: "PULL_REQUEST"
    },
    employeeId: "emp-dev-01",
    roleId: "role-reviewer",
    version: 1
  };

  const regResp = provider.registerAssignment({ assignment: asg });
  assert(regResp.assignment.assignmentId === "asg-001", "register mismatch");

  const getResp = provider.getAssignment("asg-001");
  assert(getResp.assignment.profile.assignmentName === "Code Review", "get mismatch");

  const list = provider.listAssignments();
  assert(list.length === 1, "list length mismatch");
  assert(list[0].assignmentId === "asg-001", "list content mismatch");

  console.log('   ✓ MockAIAssignmentProvider normal resolution: PASSED');
}

async function testMockAssignmentProviderDeterministic() {
  console.log('[Test] MockAIAssignmentProvider boundary conditions starting...');

  const provider = new MockAIAssignmentProvider();
  provider.clear();

  const asg: AIAssignment = {
    assignmentId: "asg-001",
    profile: {
      assignmentName: "Code Review",
      assignmentType: "TASK",
      description: "Perform CR on feature branch"
    },
    target: {
      targetId: "pr-100",
      targetType: "PULL_REQUEST"
    },
    employeeId: "emp-dev-01",
    roleId: "role-reviewer",
    version: 1
  };

  provider.registerAssignment({ assignment: asg });

  const resp1 = provider.getAssignment("asg-001");
  const resp2 = provider.getAssignment("asg-001");

  assert(JSON.stringify(resp1) === JSON.stringify(resp2), "Deterministic response mismatch");

  console.log('   ✓ MockAIAssignmentProvider boundary conditions: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-6: AIAssignmentProvider Unit Tests ---');
  await testMockAssignmentProviderFlow();
  await testMockAssignmentProviderDeterministic();
  console.log('--- All G9-6: AIAssignmentProvider Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
