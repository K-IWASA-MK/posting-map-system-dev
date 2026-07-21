import { AIAssignmentResponse } from '../../../aios/workforce/AIAssignmentResponse';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testResponseStructure() {
  console.log('[Test] AIAssignmentResponse structural properties starting...');

  const response: AIAssignmentResponse = {
    assignment: {
      assignmentId: "asg-resp-01",
      profile: {
        assignmentName: "Response Assignment",
        assignmentType: "TEST",
        description: "Response assignment description"
      },
      target: {
        targetId: "t-2",
        targetType: "TASK"
      },
      employeeId: "emp-2",
      roleId: "role-2",
      version: 1
    }
  };

  assert(response.assignment.assignmentId === "asg-resp-01", "assignmentId mismatch");
  assert(response.assignment.profile.assignmentName === "Response Assignment", "assignmentName mismatch");

  console.log('   ✓ AIAssignmentResponse structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-6: AIAssignmentResponse Unit Tests ---');
  await testResponseStructure();
  console.log('--- All G9-6: AIAssignmentResponse Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
