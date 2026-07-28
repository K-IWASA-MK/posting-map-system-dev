/**
 * test_execution_runtime_engine.ts
 * 
 * AI Employee Execution Runtime Engine Unit Test Suite (Sprint 2 - Phase 5)
 */

import {
  AIEmployeeAssignmentRuntime,
  AIEmployeeExecutionRuntime,
  ExecutionPermissionGate,
  ExecutionPermissionScope,
  ExecutionPlanFactory,
  ExecutionPlanRegistry,
  ExecutionPlanStatus,
  ExecutionStepHandlerRegistry,
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

async function testNormalEndToEndExecutionFlow() {
  console.log('[Test] Normal End-to-End Execution Flow (ASSIGNED -> RUNNING -> VERIFYING -> COMPLETED) starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  ExecutionStepHandlerRegistry.clear();

  const empId = 'EMP-AIOS-EXEC-01';
  ExecutionPermissionGate.grantPermissions(empId, [
    ExecutionPermissionScope.READ_FILE,
    ExecutionPermissionScope.WRITE_FILE,
    ExecutionPermissionScope.GIT_COMMIT,
    ExecutionPermissionScope.BROWSER_ACTION,
    ExecutionPermissionScope.DEPLOY_PRODUCTION
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

  // 1. Create Task
  const task = ExecutionTaskFactory.createTask({
    taskId: 'TASK-E2E-01',
    title: 'Full Autonomous Deployment & Verification Task',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.BROWSER_AUTOMATION],
    metadata: {
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'a1b2c3d4e5f6'
    }
  });

  ExecutionTaskRegistry.register(task);

  // 2. Assign Task
  AIEmployeeAssignmentRuntime.assignTask(task.taskId, empId, employeeCapList);

  // 3. Register Step Handlers
  ExecutionStepHandlerRegistry.registerHandler({
    actionType: 'probe_capability',
    handler: async () => ({ success: true, output: 'Capabilities probe passed' })
  });

  ExecutionStepHandlerRegistry.registerHandler({
    actionType: 'git_status_check',
    requiredPermissionScope: ExecutionPermissionScope.GIT_COMMIT,
    handler: async () => ({ success: true, output: 'Git status clean' })
  });

  ExecutionStepHandlerRegistry.registerHandler({
    actionType: 'browser_verify',
    requiredPermissionScope: ExecutionPermissionScope.BROWSER_ACTION,
    handler: async () => ({ success: true, output: 'Browser rendering verified' })
  });

  // 4. Create Plan
  const plan = ExecutionPlanFactory.createPlan({
    taskId: task.taskId,
    employeeId: empId,
    steps: [
      { title: 'Probe Environment Capabilities', actionType: 'probe_capability' },
      { title: 'Check Git Status', actionType: 'git_status_check' },
      { title: 'Verify Browser Rendering', actionType: 'browser_verify' }
    ]
  });

  ExecutionPlanRegistry.register(plan);

  // 5. Execute Task Plan
  const result = await AIEmployeeExecutionRuntime.executeTaskPlan(task.taskId, plan.planId, employeeCapList);

  assert(result.taskStatus === ExecutionTaskStatus.COMPLETED, 'Task status should be COMPLETED');
  assert(result.planStatus === ExecutionPlanStatus.COMPLETED, 'Plan status should be COMPLETED');
  assert(result.governanceDecision === 'ALLOW', 'Governance decision should be ALLOW');
  assert(result.stepResults.length === 3, 'Should execute 3 steps');
  assert(result.stepResults.every((r) => r.success), 'All steps should succeed');

  console.log('   ✓ Normal End-to-End Execution Flow: PASSED');
}

async function testPermissionBlockExecutionFlow() {
  console.log('[Test] Permission Block Execution Flow (BLOCKED) starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  ExecutionStepHandlerRegistry.clear();

  const empId = 'EMP-UNPRIVILEGED-01';
  // Grant ONLY READ_FILE permission (No SYSTEM_ADMIN)
  ExecutionPermissionGate.grantPermission(empId, ExecutionPermissionScope.READ_FILE);

  const task = ExecutionTaskFactory.createTask({
    taskId: 'TASK-PERM-BLOCK-01',
    title: 'High Risk Admin Task',
    requiredCapabilities: []
  });
  ExecutionTaskRegistry.register(task);
  ExecutionTaskRegistry.assignEmployee(task.taskId, empId);

  ExecutionStepHandlerRegistry.registerHandler({
    actionType: 'admin_sys_op',
    requiredPermissionScope: ExecutionPermissionScope.SYSTEM_ADMIN,
    handler: async () => ({ success: true })
  });

  const plan = ExecutionPlanFactory.createPlan({
    taskId: task.taskId,
    employeeId: empId,
    steps: [
      { title: 'Execute Admin Operation', actionType: 'admin_sys_op' }
    ]
  });
  ExecutionPlanRegistry.register(plan);

  const result = await AIEmployeeExecutionRuntime.executeTaskPlan(task.taskId, plan.planId);

  assert(result.taskStatus === ExecutionTaskStatus.BLOCKED, 'Task status should be BLOCKED');
  assert(result.planStatus === ExecutionPlanStatus.BLOCKED, 'Plan status should be BLOCKED');
  assert(result.reason.includes('Permission DENIED'), 'Reason should explain permission denial');

  console.log('   ✓ Permission Block Execution Flow: PASSED');
}

async function testMissingStepHandlerExecutionFlow() {
  console.log('[Test] Missing Step Handler Execution Flow (FAILED) starting...');

  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  ExecutionStepHandlerRegistry.clear();

  const empId = 'EMP-AI-01';
  ExecutionPermissionGate.grantPermission(empId, ExecutionPermissionScope.READ_FILE);

  const task = ExecutionTaskFactory.createTask({
    taskId: 'TASK-MISSING-HANDLER-01',
    title: 'Unknown Handler Task'
  });
  ExecutionTaskRegistry.register(task);
  ExecutionTaskRegistry.assignEmployee(task.taskId, empId);

  const plan = ExecutionPlanFactory.createPlan({
    taskId: task.taskId,
    employeeId: empId,
    steps: [
      { title: 'Unknown Action Step', actionType: 'non_existent_action' }
    ]
  });
  ExecutionPlanRegistry.register(plan);

  const result = await AIEmployeeExecutionRuntime.executeTaskPlan(task.taskId, plan.planId);

  assert(result.taskStatus === ExecutionTaskStatus.FAILED, 'Task status should be FAILED');
  assert(result.planStatus === ExecutionPlanStatus.FAILED, 'Plan status should be FAILED');
  assert(result.reason.includes('Missing step handler'), 'Reason should explain missing handler');

  console.log('   ✓ Missing Step Handler Execution Flow: PASSED');
}

async function runAll() {
  console.log('--- Starting AI Employee Execution Runtime Engine Unit Tests ---');
  await testNormalEndToEndExecutionFlow();
  await testPermissionBlockExecutionFlow();
  await testMissingStepHandlerExecutionFlow();
  console.log('--- All AI Employee Execution Runtime Engine Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
