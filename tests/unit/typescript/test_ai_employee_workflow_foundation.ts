/**
 * test_ai_employee_workflow_foundation.ts
 * 
 * TASK-AIOS-012: AI Employee Workflow Foundation Comprehensive Test Suite
 */

import {
  WorkflowId,
  WorkflowInstanceId,
  WorkflowCategory,
  EmployeeWorkflow,
  WorkflowInstance,
  WorkflowInstanceStatus,
  WorkflowRegistry,
  WorkflowInstanceRegistry,
  StageId,
  StageState,
  WorkflowStage,
  WorkflowBlueprint,
  WorkflowBlueprintRegistry,
  WorkflowFactory,
  StageAssignment,
  WorkflowAssignment,
  AssignmentResolver,
  WorkflowProgress,
  WorkflowProgressTracker,
  WorkflowEventType,
  WorkflowEvent,
  WorkflowEventPublisher,
  StageTransitionResolver,
  WorkflowRouter,
  WorkflowCoordinator,
  StandardWorkflowCatalog,
  WorkflowBootstrap,
  SupervisorRuntime,
  EmployeeRole,
  DepartmentId,
  EmployeeProvisioningService
} from '../../../sdk/employee';
import { BootstrapManager, AutonomousRuntimeState } from '../../../sdk/runtime';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function resetEnvironment() {
  BootstrapManager.clear();
  EmployeeProvisioningService.clear();
  WorkflowRegistry.clear();
  WorkflowInstanceRegistry.clear();
  WorkflowBlueprintRegistry.clear();
  WorkflowProgressTracker.clear();
  WorkflowEventPublisher.clear();
}

// Test 1: Workflow & WorkflowInstance Pure Registries
function test1_WorkflowAndInstanceRegistries() {
  console.log('[Test 1] Workflow & WorkflowInstance Registries starting...');
  resetEnvironment();

  const wf: EmployeeWorkflow = {
    workflowId: WorkflowId.of('WF_TEST'),
    workflowName: 'Test Workflow',
    category: WorkflowCategory.ENGINEERING,
    description: 'Test Description',
    stages: [],
    createdAt: new Date().toISOString()
  };

  WorkflowRegistry.register(wf);
  assert(WorkflowRegistry.getAll().length === 1, 'WorkflowRegistry should contain 1 workflow');
  assert(WorkflowRegistry.find('WF_TEST')?.workflowName === 'Test Workflow', 'Found workflow name should match');

  const inst: WorkflowInstance = {
    instanceId: WorkflowInstanceId.of('inst-test-01'),
    taskId: 'TASK-101',
    workflowId: wf.workflowId,
    workflowName: wf.workflowName,
    stages: [],
    status: WorkflowInstanceStatus.RUNNING,
    startedAt: new Date().toISOString()
  };

  WorkflowInstanceRegistry.register(inst);
  assert(WorkflowInstanceRegistry.getAll().length === 1, 'WorkflowInstanceRegistry should contain 1 instance');
  assert(WorkflowInstanceRegistry.findByTaskId('TASK-101')?.instanceId.getValue() === 'inst-test-01', 'Found instance by taskId should match');

  console.log('   ✓ Test 1: Workflow & WorkflowInstance Registries: PASSED');
}

// Test 2: Workflow Blueprint & WorkflowFactory Generation
function test2_WorkflowBlueprintAndFactory() {
  console.log('[Test 2] Workflow Blueprint & WorkflowFactory starting...');
  resetEnvironment();

  const bp = StandardWorkflowCatalog.E2E_FULL_DELIVERY_WORKFLOW;
  WorkflowBlueprintRegistry.register(bp);

  assert(WorkflowBlueprintRegistry.getAll().length === 1, 'Blueprint registry should contain 1 blueprint');

  const instance = WorkflowFactory.createInstanceFromBlueprint(bp, 'TASK-202');
  assert(instance.stages.length === 5, 'Generated instance should contain 5 stages');
  assert(instance.stages[0].state === StageState.READY, 'First stage state should be READY');
  assert(instance.stages[1].state === StageState.PENDING, 'Second stage state should be PENDING');
  assert(instance.status === WorkflowInstanceStatus.RUNNING, 'Instance status should be RUNNING');

  console.log('   ✓ Test 2: Workflow Blueprint & WorkflowFactory: PASSED');
}

// Test 3: Stage Input / Output / Produced Artifacts
function test3_StageInputsOutputsAndArtifacts() {
  console.log('[Test 3] Stage Input / Output / Produced Artifacts starting...');
  resetEnvironment();

  const stage: WorkflowStage = {
    stageId: StageId.of('STG_RESEARCH'),
    stageName: 'Research Stage',
    order: 1,
    requiredProfessionCategory: WorkflowCategory.RESEARCH as any,
    state: StageState.PENDING,
    inputs: ['Task Request Specs'],
    expectedOutputs: ['Architecture Document'],
    producedArtifacts: ['spec_notes.md']
  };

  assert(stage.inputs?.length === 1, 'Inputs count should be 1');
  assert(stage.expectedOutputs?.[0] === 'Architecture Document', 'Expected output should match');
  assert(stage.producedArtifacts?.[0] === 'spec_notes.md', 'Produced artifact should match');

  console.log('   ✓ Test 3: Stage Input / Output / Produced Artifacts: PASSED');
}

// Test 4: Stage Transition Resolver
function test4_StageTransitionResolver() {
  console.log('[Test 4] Stage Transition Resolver starting...');
  resetEnvironment();

  const bp = StandardWorkflowCatalog.E2E_FULL_DELIVERY_WORKFLOW;
  const instance = WorkflowFactory.createInstanceFromBlueprint(bp, 'TASK-303');

  const stage1 = instance.stages[0]; // Research
  const stage2 = instance.stages[1]; // Validation (depends on Research)

  assert(StageTransitionResolver.canStageStart(instance, stage1), 'Stage 1 should be ready to start');
  assert(!StageTransitionResolver.canStageStart(instance, stage2), 'Stage 2 should NOT start until Stage 1 complete');

  // Complete Stage 1
  stage1.state = StageState.COMPLETED;
  assert(StageTransitionResolver.canStageStart(instance, stage2), 'Stage 2 SHOULD start after Stage 1 complete');

  console.log('   ✓ Test 4: Stage Transition Resolver: PASSED');
}

// Test 5: Profession Assignment & AssignmentResolver
function test5_ProfessionAssignmentAndResolver() {
  console.log('[Test 5] Profession Assignment & Resolver starting...');
  resetEnvironment();

  BootstrapManager.initialize();

  const supervisor = new SupervisorRuntime();
  const bp = StandardWorkflowCatalog.E2E_FULL_DELIVERY_WORKFLOW;
  const instance = WorkflowFactory.createInstanceFromBlueprint(bp, 'TASK-404');
  const stage1 = instance.stages[0]; // Research

  const assignment = AssignmentResolver.createStageAssignment(stage1);
  assert(assignment.stageId === 'STG_1_RESEARCH', 'Assignment stageId should match');
  assert(assignment.requiredProfessionCategory === 'RESEARCH', 'Category should be RESEARCH');

  console.log('   ✓ Test 5: Profession Assignment & Resolver: PASSED');
}

// Test 6: Workflow Progress Tracking
function test6_WorkflowProgressTracking() {
  console.log('[Test 6] Workflow Progress Tracking starting...');
  resetEnvironment();

  const bp = StandardWorkflowCatalog.E2E_FULL_DELIVERY_WORKFLOW;
  const instance = WorkflowFactory.createInstanceFromBlueprint(bp, 'TASK-505');

  let progress = WorkflowProgressTracker.calculateProgress(instance);
  assert(progress.progressPercentage === 0, 'Initial progress should be 0%');

  // Complete 2 out of 5 stages
  instance.stages[0].state = StageState.COMPLETED;
  instance.stages[0].producedArtifacts = ['research.md'];
  instance.stages[1].state = StageState.COMPLETED;
  instance.stages[1].producedArtifacts = ['approved.md'];

  progress = WorkflowProgressTracker.calculateProgress(instance);
  assert(progress.progressPercentage === 40, `Progress should be 40%, got ${progress.progressPercentage}%`);
  assert(progress.producedArtifacts.length >= 2, 'Produced artifacts count should be at least 2');

  console.log('   ✓ Test 6: Workflow Progress Tracking: PASSED');
}

// Test 7: Workflow Events Model & Publisher
function test7_WorkflowEventsModelAndPublisher() {
  console.log('[Test 7] Workflow Events Model & Publisher starting...');
  resetEnvironment();

  const events: WorkflowEvent[] = [];
  const unsubscribe = WorkflowEventPublisher.subscribe((e) => { events.push(e); });

  WorkflowEventPublisher.publish(
    WorkflowEventType.WORKFLOW_CREATED,
    'inst-01',
    'TASK-606',
    { name: 'Test Flow' }
  );

  assert(events.length === 1, 'Event listener should receive 1 event');
  assert(events[0].type === WorkflowEventType.WORKFLOW_CREATED, 'Event type should be WORKFLOW_CREATED');

  unsubscribe();
  console.log('   ✓ Test 7: Workflow Events Model & Publisher: PASSED');
}

// Test 8: Modular Workflow Coordinator & Router
function test8_ModularWorkflowCoordinatorAndRouter() {
  console.log('[Test 8] Modular Workflow Coordinator & Router starting...');
  resetEnvironment();

  const bp = StandardWorkflowCatalog.E2E_FULL_DELIVERY_WORKFLOW;
  const instance = WorkflowFactory.createInstanceFromBlueprint(bp, 'TASK-707');
  const coordinator = new WorkflowCoordinator();

  const startedStage = WorkflowRouter.startCurrentStage(instance, 'STG_1_RESEARCH');
  assert(startedStage !== undefined, 'Stage 1 should start successfully');
  assert(startedStage?.state === StageState.RUNNING, 'Stage 1 state should be RUNNING');

  const nextStage = WorkflowRouter.completeStage(instance, 'STG_1_RESEARCH', ['output.md']);
  assert(nextStage !== undefined, 'Next stage should be returned upon stage completion');
  assert(nextStage?.stageId.getValue() === 'STG_2_VALIDATION', 'Next stage should be STG_2_VALIDATION');

  console.log('   ✓ Test 8: Modular Workflow Coordinator & Router: PASSED');
}

// Test 9: End-to-End Workflow Simulation (Research -> Validation -> Implementation -> QA -> Deployment -> COMPLETED)
function test9_EndToEndWorkflowSimulation() {
  console.log('[Test 9] End-to-End Workflow Simulation starting...');
  resetEnvironment();

  BootstrapManager.initialize();
  const supervisor = new SupervisorRuntime();

  // 1. Instantiate E2E Full Delivery Workflow
  const wfResult = supervisor.instantiateAndOrchestrateWorkflow('bp-wf-e2e-delivery', 'TASK-E2E-999');
  assert(wfResult !== null, 'Workflow instantiation should succeed');

  const { instance, assignment } = wfResult!;
  assert(instance.status === WorkflowInstanceStatus.RUNNING, 'Workflow instance should be RUNNING');
  assert(assignment !== null, 'First worker assignment should not be null');
  assert(instance.currentStageId === 'STG_1_RESEARCH', 'Current stage should be Stage 1 (Research)');

  // 2. Advance Stage 1 (Research) -> Stage 2 (Validation)
  const res1 = supervisor.advanceWorkflowStage(instance.instanceId.getValue(), ['research_report.md']);
  assert(res1 !== null && res1.instance.currentStageId === 'STG_2_VALIDATION', 'Should advance to Stage 2 (Validation)');

  // 3. Advance Stage 2 (Validation) -> Stage 3 (Implementation)
  const res2 = supervisor.advanceWorkflowStage(instance.instanceId.getValue(), ['approved_spec.md']);
  assert(res2 !== null && res2.instance.currentStageId === 'STG_3_IMPLEMENTATION', 'Should advance to Stage 3 (Implementation)');

  // 4. Advance Stage 3 (Implementation) -> Stage 4 (QA)
  const res3 = supervisor.advanceWorkflowStage(instance.instanceId.getValue(), ['feature_code.ts']);
  assert(res3 !== null && res3.instance.currentStageId === 'STG_4_QA', 'Should advance to Stage 4 (QA)');

  // 5. Advance Stage 4 (QA) -> Stage 5 (Deployment)
  const res4 = supervisor.advanceWorkflowStage(instance.instanceId.getValue(), ['qa_report.json']);
  assert(res4 !== null && res4.instance.currentStageId === 'STG_5_DEPLOYMENT', 'Should advance to Stage 5 (Deployment)');

  // 6. Advance Stage 5 (Deployment) -> WORKFLOW COMPLETED
  const res5 = supervisor.advanceWorkflowStage(instance.instanceId.getValue(), ['deployment_manifest.json']);
  assert(res5 !== null && res5.instance.status === WorkflowInstanceStatus.COMPLETED, 'Workflow status should be COMPLETED');

  const progress = WorkflowProgressTracker.getProgress(instance.instanceId.getValue());
  assert(progress?.progressPercentage === 100, `Final progress percentage should be 100%, got ${progress?.progressPercentage}%`);
  assert(progress?.producedArtifacts.length! >= 5, `Produced artifacts should be >= 5, got ${progress?.producedArtifacts.length}`);

  console.log('   ✓ Test 9: End-to-End Workflow Simulation: PASSED');
}

async function runAll() {
  console.log('========================================================');
  console.log('TASK-AIOS-012: AI Employee Workflow Foundation Test Suite');
  console.log('========================================================');

  test1_WorkflowAndInstanceRegistries();
  test2_WorkflowBlueprintAndFactory();
  test3_StageInputsOutputsAndArtifacts();
  test4_StageTransitionResolver();
  test5_ProfessionAssignmentAndResolver();
  test6_WorkflowProgressTracking();
  test7_WorkflowEventsModelAndPublisher();
  test8_ModularWorkflowCoordinatorAndRouter();
  test9_EndToEndWorkflowSimulation();

  console.log('========================================================');
  console.log('ALL AI EMPLOYEE WORKFLOW FOUNDATION TESTS PASSED!');
  console.log('========================================================');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
