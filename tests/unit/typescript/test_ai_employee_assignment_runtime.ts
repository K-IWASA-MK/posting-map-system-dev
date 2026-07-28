/**
 * test_ai_employee_assignment_runtime.ts
 * 
 * AI Employee Assignment Runtime Unit Test Suite (Sprint 2 - Phase 3)
 */

import {
  AIEmployeeAssignmentRuntime,
  ExecutionPermissionGate,
  ExecutionPermissionScope,
  ExecutionTaskFactory,
  ExecutionTaskPriority,
  ExecutionTaskRegistry,
  ExecutionTaskStatus
} from '../../../sdk/execution';
import {
  VerificationCapabilityFactory,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../../../sdk/verification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testExecutionPermissionGate() {
  console.log('[Test] Execution Permission Gate starting...');

  ExecutionPermissionGate.clearPermissions();

  const empId = 'EMP-GATE-01';
  ExecutionPermissionGate.grantPermissions(empId, [
    ExecutionPermissionScope.READ_FILE,
    ExecutionPermissionScope.WRITE_FILE,
    ExecutionPermissionScope.GIT_COMMIT
  ]);

  const readCheck = ExecutionPermissionGate.checkPermission(empId, ExecutionPermissionScope.READ_FILE);
  assert(readCheck.allowed === true, 'READ_FILE should be allowed');

  const pushCheck = ExecutionPermissionGate.checkPermission(empId, ExecutionPermissionScope.GIT_PUSH);
  assert(pushCheck.allowed === false, 'GIT_PUSH should be denied when not granted');

  // Revoke permission
  ExecutionPermissionGate.revokePermission(empId, ExecutionPermissionScope.GIT_COMMIT);
  const commitCheck = ExecutionPermissionGate.checkPermission(empId, ExecutionPermissionScope.GIT_COMMIT);
  assert(commitCheck.allowed === false, 'GIT_COMMIT should be denied after revocation');

  console.log('   ✓ Execution Permission Gate: PASSED');
}

async function testAssignmentEvaluationMatching() {
  console.log('[Test] Assignment Evaluation Capability & Permission Matching starting...');

  ExecutionPermissionGate.clearPermissions();
  const empId = 'EMP-MATCH-01';

  // Grant permissions for Git & Browser Actions
  ExecutionPermissionGate.grantPermissions(empId, [
    ExecutionPermissionScope.GIT_COMMIT,
    ExecutionPermissionScope.BROWSER_ACTION
  ]);

  // Employee available capabilities
  const employeeCapList = [
    VerificationCapabilityFactory.createCapability({
      type: VerificationCapabilityType.GIT_ACCESS,
      status: VerificationCapabilityStatus.AVAILABLE
    }),
    VerificationCapabilityFactory.createCapability({
      type: VerificationCapabilityType.BROWSER_AUTOMATION,
      status: VerificationCapabilityStatus.AVAILABLE
    })
  ];

  // 1. Task with matching capabilities
  const matchingTask = ExecutionTaskFactory.createTask({
    title: 'Git and Browser Task',
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.BROWSER_AUTOMATION]
  });

  const matchEval = AIEmployeeAssignmentRuntime.evaluateAssignment(matchingTask, empId, employeeCapList);
  assert(matchEval.assignable === true, 'Matching task should be assignable');
  assert(matchEval.matchScore === 100, 'Match score should be 100');

  // 2. Task requiring missing capability (e.g. DEPLOYMENT_STATUS)
  const unmatchingTask = ExecutionTaskFactory.createTask({
    title: 'Deploy Task',
    requiredCapabilities: [
      VerificationCapabilityType.GIT_ACCESS,
      VerificationCapabilityType.DEPLOYMENT_STATUS
    ]
  });

  const unmatchEval = AIEmployeeAssignmentRuntime.evaluateAssignment(unmatchingTask, empId, employeeCapList);
  assert(unmatchEval.assignable === false, 'Unmatching task should be rejected');
  assert(unmatchEval.missingCapabilities.includes(VerificationCapabilityType.DEPLOYMENT_STATUS), 'Should identify DEPLOYMENT_STATUS as missing');

  // 3. Task requiring capability that is AVAILABLE, but Permission Gate DENIES scope
  const capListWithDeploy = [
    ...employeeCapList,
    VerificationCapabilityFactory.createCapability({
      type: VerificationCapabilityType.DEPLOYMENT_STATUS,
      status: VerificationCapabilityStatus.AVAILABLE
    })
  ];

  // EMP-MATCH-01 does NOT have DEPLOY_PRODUCTION permission granted
  const permDeniedEval = AIEmployeeAssignmentRuntime.evaluateAssignment(unmatchingTask, empId, capListWithDeploy);
  assert(permDeniedEval.assignable === false, 'Task should be rejected when Permission Gate denies scope');
  assert(permDeniedEval.permissionDeniedReasons.length >= 1, 'Should contain permission denied reason');

  console.log('   ✓ Assignment Evaluation Capability & Permission Matching: PASSED');
}

async function testAssignTaskIntegrationWithRegistry() {
  console.log('[Test] assignTask Integration with ExecutionTaskRegistry starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPermissionGate.clearPermissions();

  const empId = 'EMP-ROBOT-01';
  ExecutionPermissionGate.grantPermissions(empId, [
    ExecutionPermissionScope.GIT_COMMIT,
    ExecutionPermissionScope.BROWSER_ACTION
  ]);

  const employeeCapList = [
    VerificationCapabilityFactory.createCapability({
      type: VerificationCapabilityType.GIT_ACCESS,
      status: VerificationCapabilityStatus.AVAILABLE
    }),
    VerificationCapabilityFactory.createCapability({
      type: VerificationCapabilityType.BROWSER_AUTOMATION,
      status: VerificationCapabilityStatus.AVAILABLE
    })
  ];

  const task = ExecutionTaskFactory.createTask({
    taskId: 'TASK-ASSIGN-RUN-01',
    title: 'Integrate Task Assignment',
    requiredCapabilities: [VerificationCapabilityType.BROWSER_AUTOMATION]
  });

  ExecutionTaskRegistry.register(task);

  // Assign task via AIEmployeeAssignmentRuntime
  const assignedTask = AIEmployeeAssignmentRuntime.assignTask('TASK-ASSIGN-RUN-01', empId, employeeCapList);
  assert(assignedTask.assignedEmployeeId === empId, 'Assigned employee ID mismatch');
  assert(assignedTask.status === ExecutionTaskStatus.ASSIGNED, 'Task status should be ASSIGNED');

  const registryTask = ExecutionTaskRegistry.get('TASK-ASSIGN-RUN-01');
  assert(registryTask?.assignedEmployeeId === empId, 'Registry task should reflect assignment');

  // Attempting to assign unassignable task must throw Error
  const highReqTask = ExecutionTaskFactory.createTask({
    taskId: 'TASK-ASSIGN-FAIL-02',
    title: 'High Security Task',
    requiredCapabilities: [VerificationCapabilityType.DEPLOYMENT_STATUS]
  });
  ExecutionTaskRegistry.register(highReqTask);

  let errorThrown = false;
  try {
    AIEmployeeAssignmentRuntime.assignTask('TASK-ASSIGN-FAIL-02', empId, employeeCapList);
  } catch (err) {
    errorThrown = true;
  }
  assert(errorThrown, 'assignTask must throw Error when assignment evaluation fails');

  console.log('   ✓ assignTask Integration with ExecutionTaskRegistry: PASSED');
}

async function runAll() {
  console.log('--- Starting AI Employee Assignment Runtime Unit Tests ---');
  await testExecutionPermissionGate();
  await testAssignmentEvaluationMatching();
  await testAssignTaskIntegrationWithRegistry();
  console.log('--- All AI Employee Assignment Runtime Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
