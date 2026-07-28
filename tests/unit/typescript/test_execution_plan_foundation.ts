/**
 * test_execution_plan_foundation.ts
 * 
 * Execution Plan Foundation Unit Test Suite (Sprint 2 - Phase 4)
 */

import {
  ExecutionPermissionScope,
  ExecutionPlanFactory,
  ExecutionPlanRegistry,
  ExecutionPlanStatus,
  ExecutionPlanValidator,
  ExecutionStepStatus
} from '../../../sdk/execution';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testPlanCreationAndValidation() {
  console.log('[Test] ExecutionPlan Creation & Step Order Validation starting...');

  const plan = ExecutionPlanFactory.createPlan({
    taskId: 'TASK-DEPLOY-VERIFY-01',
    employeeId: 'EMP-AIOS-BUILDER',
    steps: [
      {
        title: 'Check Environment Capabilities',
        actionType: 'probe_capability'
      },
      {
        title: 'Audit Git Repository & Branch',
        actionType: 'git_status_check',
        requiredPermissionScope: ExecutionPermissionScope.GIT_COMMIT
      },
      {
        title: 'Monitor GitHub Actions CI/CD Pipeline',
        actionType: 'ci_monitor',
        requiredPermissionScope: ExecutionPermissionScope.DEPLOY_PRODUCTION
      },
      {
        title: 'Execute Visual Browser Rendering Audit',
        actionType: 'browser_verify',
        requiredPermissionScope: ExecutionPermissionScope.BROWSER_ACTION
      }
    ]
  });

  assert(plan.planId.startsWith('PLAN-'), 'Plan ID should start with PLAN-');
  assert(plan.taskId === 'TASK-DEPLOY-VERIFY-01', 'Task ID mismatch');
  assert(plan.employeeId === 'EMP-AIOS-BUILDER', 'Employee ID mismatch');
  assert(plan.status === ExecutionPlanStatus.READY, 'Default plan status should be READY');
  assert(plan.steps.length === 4, 'Steps count should be 4');
  assert(plan.steps[0].order === 1, 'First step order should be 1');
  assert(plan.steps[1].order === 2, 'Second step order should be 2');
  assert(plan.steps[0].stepId === 'STEP-01', 'First step ID should be STEP-01');
  assert(plan.steps[1].stepId === 'STEP-02', 'Second step ID should be STEP-02');
  assert(plan.steps[2].requiredPermissionScope === ExecutionPermissionScope.DEPLOY_PRODUCTION, 'Third step permission mismatch');
  assert(ExecutionPlanValidator.validatePlan(plan), 'Plan validation should pass');

  console.log('   ✓ ExecutionPlan Creation & Step Order Validation: PASSED');
}

async function testInvalidPlanRejection() {
  console.log('[Test] Invalid Plan Structure Rejection starting...');

  // Empty steps array
  let errorThrown = false;
  try {
    ExecutionPlanFactory.createPlan({
      taskId: 'TASK-FAIL-01',
      employeeId: 'EMP-01',
      steps: []
    });
  } catch (err) {
    errorThrown = true;
  }
  assert(errorThrown, 'Factory must throw error on empty steps array');

  // Invalid step orders in validator
  assert(!ExecutionPlanValidator.validatePlan({
    planId: 'PLAN-20260728-100001',
    taskId: 'TASK-01',
    employeeId: 'EMP-01',
    status: ExecutionPlanStatus.READY,
    steps: [
      { stepId: 'STEP-01', order: 1, title: 'Step 1', actionType: 'test', status: ExecutionStepStatus.PENDING },
      { stepId: 'STEP-02', order: 3, title: 'Step 2', actionType: 'test', status: ExecutionStepStatus.PENDING } // Gap in order
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), 'Validator must reject non-sequential step orders');

  // Duplicate step IDs
  assert(!ExecutionPlanValidator.validatePlan({
    planId: 'PLAN-20260728-100002',
    taskId: 'TASK-01',
    employeeId: 'EMP-01',
    status: ExecutionPlanStatus.READY,
    steps: [
      { stepId: 'STEP-01', order: 1, title: 'Step 1', actionType: 'test', status: ExecutionStepStatus.PENDING },
      { stepId: 'STEP-01', order: 2, title: 'Step 2', actionType: 'test', status: ExecutionStepStatus.PENDING } // Duplicate stepId
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), 'Validator must reject duplicate step IDs');

  console.log('   ✓ Invalid Plan Structure Rejection: PASSED');
}

async function testPlanRegistryAndStepProgress() {
  console.log('[Test] Plan Registry & Step Progress Updates starting...');

  ExecutionPlanRegistry.clear();

  const plan = ExecutionPlanFactory.createPlan({
    taskId: 'TASK-REG-PLAN-01',
    employeeId: 'EMP-WORKER-01',
    steps: [
      { title: 'Step 1: Check', actionType: 'check' },
      { title: 'Step 2: Build', actionType: 'build' }
    ]
  });

  ExecutionPlanRegistry.register(plan);
  assert(ExecutionPlanRegistry.get(plan.planId)?.taskId === 'TASK-REG-PLAN-01', 'Registry get mismatch');
  assert(ExecutionPlanRegistry.getByTask('TASK-REG-PLAN-01').length === 1, 'getByTask count mismatch');
  assert(ExecutionPlanRegistry.getByEmployee('EMP-WORKER-01').length === 1, 'getByEmployee count mismatch');

  // Update Plan Status to EXECUTING
  const executingPlan = ExecutionPlanRegistry.updatePlanStatus(plan.planId, ExecutionPlanStatus.EXECUTING);
  assert(executingPlan.status === ExecutionPlanStatus.EXECUTING, 'Plan status should be EXECUTING');

  // Update Step 1 Status to COMPLETED
  const stepUpdatedPlan = ExecutionPlanRegistry.updateStepStatus(plan.planId, 'STEP-01', ExecutionStepStatus.COMPLETED, {
    success: true,
    output: 'Check passed successfully',
    durationMs: 150
  });

  assert(stepUpdatedPlan.steps[0].status === ExecutionStepStatus.COMPLETED, 'Step 1 status should be COMPLETED');
  assert(stepUpdatedPlan.steps[0].result?.output === 'Check passed successfully', 'Step 1 output mismatch');
  assert(stepUpdatedPlan.steps[1].status === ExecutionStepStatus.PENDING, 'Step 2 status should remain PENDING');

  // Snapshot test
  const snapshot = ExecutionPlanRegistry.captureSnapshot();
  assert(snapshot.totalPlansCount === 1, 'Snapshot total count mismatch');
  assert(snapshot.statusCounts[ExecutionPlanStatus.EXECUTING] === 1, 'Snapshot EXECUTING count mismatch');

  console.log('   ✓ Plan Registry & Step Progress Updates: PASSED');
}

async function runAll() {
  console.log('--- Starting Execution Plan Foundation Unit Tests ---');
  await testPlanCreationAndValidation();
  await testInvalidPlanRejection();
  await testPlanRegistryAndStepProgress();
  console.log('--- All Execution Plan Foundation Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
