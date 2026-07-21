import { AIAssignment } from '../../../aios/workforce/AIAssignment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testAssignmentStructure() {
  console.log('[Test] AIAssignment structural properties starting...');

  const assignment: AIAssignment = {
    assignmentId: "asg-001",
    profile: {
      assignmentName: "Code Review Task",
      assignmentType: "ON_DEMAND",
      description: "Review G9-6 pull request"
    },
    target: {
      targetId: "pr-999",
      targetType: "PULL_REQUEST"
    },
    employeeId: "emp-sec-01",
    roleId: "role-reviewer",
    version: 1,
    metadata: { active: true }
  };

  assert(assignment.assignmentId === "asg-001", "assignmentId mismatch");
  assert(assignment.profile.assignmentName === "Code Review Task", "profile name mismatch");
  assert(assignment.target.targetId === "pr-999", "targetId mismatch");
  assert(assignment.employeeId === "emp-sec-01", "employeeId mismatch");
  assert(assignment.roleId === "role-reviewer", "roleId mismatch");
  assert(assignment.version === 1, "version mismatch");

  console.log('   ✓ AIAssignment structural properties: PASSED');
}

async function runAll() {
  console.log('--- Starting G9-6: AIAssignment Unit Tests ---');
  await testAssignmentStructure();
  console.log('--- All G9-6: AIAssignment Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
