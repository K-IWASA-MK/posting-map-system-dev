import { AIAssignmentRequest } from '../../../aios/workforce/AIAssignmentRequest';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testRequestStructure() {
  console.log('[Test] AIAssignmentRequest structural properties starting...');

  const request: AIAssignmentRequest = {
    assignment: {
      assignmentId: "asg-req-01",
      profile: {
        assignmentName: "Test Assignment",
        assignmentType: "TEST",
        description: "Test assignment request"
      },
      target: {
        targetId: "t-1",
        targetType: "TASK"
      },
      employeeId: "emp-1",
      roleId: "role-1",
      version: 1
    }
  };

  assert(request.assignment.assignmentId === "asg-req-01", "assignmentId mismatch");
  assert(request.assignment.profile.assignmentName === "Test Assignment", "assignmentName mismatch");

  console.log('   ✓ AIAssignmentRequest structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-6: AIAssignmentRequest Unit Tests ---');
  await testRequestStructure();
  console.log('--- All G9-6: AIAssignmentRequest Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
