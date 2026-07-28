/**
 * test_project_bridge_foundation.ts
 * 
 * TASK-AIOS-013: Project Bridge Foundation Comprehensive Test Suite
 */

import {
  ProjectId,
  ProjectType,
  ProjectProfile,
  ProjectRegistry,
  ProjectContextResolver,
  TaskIntakeGateway,
  WorkflowRequestBuilder,
  ArtifactReference,
  ResultBuilder,
  ProjectEventType,
  ProjectEventPublisher,
  FieldOperationsAdapter,
  HokuseiChAdapter,
  AiSecretaryAdapter,
  ProjectBridgeRuntime,
  StandardProjectCatalog,
  ProjectBootstrap
} from '../../../sdk/employee';
import { BootstrapManager } from '../../../sdk/runtime';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function resetEnvironment() {
  BootstrapManager.clear();
  ProjectBridgeRuntime.clear();
  ProjectEventPublisher.clear();
}

// Test 1: Project Registry & Pure Registry Rules
function test1_ProjectRegistry() {
  console.log('[Test 1] Project Registry starting...');
  resetEnvironment();

  const profile: ProjectProfile = {
    projectId: ProjectId.of('TEST_PROJ'),
    projectName: 'Test Project',
    projectType: ProjectType.WEB_APPLICATION,
    description: 'Test Project Description',
    capability: {
      supportsWorkflowCategories: [],
      supportedTaskTypes: ['TEST_TASK'],
      maxConcurrentTasks: 1
    },
    policy: {
      maxParallelWorkflow: 1,
      requiresHumanApproval: false,
      allowRetry: true,
      priority: 'NORMAL',
      timeoutMs: 10000
    },
    metadata: { version: '1.0.0', environment: 'development' },
    createdAt: new Date().toISOString()
  };

  ProjectRegistry.register(profile);
  assert(ProjectRegistry.getAll().length === 1, 'ProjectRegistry should contain 1 profile');
  assert(ProjectRegistry.find('TEST_PROJ')?.projectName === 'Test Project', 'Found profile name should match');

  ProjectRegistry.remove('TEST_PROJ');
  assert(ProjectRegistry.getAll().length === 0, 'ProjectRegistry should be empty after removal');

  console.log('   ✓ Test 1: Project Registry: PASSED');
}

// Test 2: Project Capability & Policy Validation
function test2_ProjectCapabilityAndPolicy() {
  console.log('[Test 2] Project Capability & Policy Validation starting...');
  resetEnvironment();

  const fieldOpsAdapter = new FieldOperationsAdapter();
  const profile = fieldOpsAdapter.getProfile();

  assert(profile.capability.supportsWorkflowCategories.length > 0, 'Capabilities should list supported categories');
  assert(profile.capability.supportedTaskTypes.includes('EXECUTE_FIELD_VERIFICATION'), 'Task type should be supported');
  assert(profile.policy.maxParallelWorkflow === 3, 'Max parallel workflow should be 3');
  assert(profile.policy.priority === 'HIGH', 'Priority should be HIGH');

  console.log('   ✓ Test 2: Project Capability & Policy Validation: PASSED');
}

// Test 3: Project Context Resolver
function test3_ProjectContextResolver() {
  console.log('[Test 3] Project Context Resolver starting...');
  resetEnvironment();

  const adapter = new HokuseiChAdapter();
  const profile = adapter.getProfile();

  const context = ProjectContextResolver.resolveContext(
    profile,
    { channel: 'Ch-01' },
    { requestId: 'req-001' }
  );

  assert(context.projectId === 'HOKUSEI_CH', 'Context projectId should be HOKUSEI_CH');
  assert(context.environment === 'production', 'Environment should be production');
  assert(context.workflowParameters?.channel === 'Ch-01', 'Workflow parameters should match');

  console.log('   ✓ Test 3: Project Context Resolver: PASSED');
}

// Test 4: Task Intake Gateway & Rejection
function test4_TaskIntakeGateway() {
  console.log('[Test 4] Task Intake Gateway & Rejection starting...');
  resetEnvironment();

  BootstrapManager.initialize();

  // Unsupported Task Type Request
  const badReq = {
    requestId: 'req-bad-01',
    projectId: 'HOKUSEI_CH',
    taskType: 'UNSUPPORTED_TYPE_XYZ',
    payload: {},
    timestamp: new Date().toISOString()
  };

  const badRes = TaskIntakeGateway.processIntake(badReq);
  assert(badRes.response.status === 'REJECTED', 'TaskIntakeGateway should REJECT unsupported task types');

  // Supported Task Type Request
  const goodReq = StandardProjectCatalog.HOKUSEI_CH.createTaskRequest('WEATHER_ALERT_PUBLISH', { region: 'Hokusei' });
  const goodRes = TaskIntakeGateway.processIntake(goodReq);
  assert(goodRes.response.status === 'ACCEPTED', 'TaskIntakeGateway should ACCEPT supported task types');
  assert(goodRes.workflowRequest !== undefined, 'WorkflowRequest should be generated');

  console.log('   ✓ Test 4: Task Intake Gateway: PASSED');
}

// Test 5: Workflow Request Builder
function test5_WorkflowRequestBuilder() {
  console.log('[Test 5] Workflow Request Builder starting...');
  resetEnvironment();

  const adapter = new AiSecretaryAdapter();
  const profile = adapter.getProfile();
  const req = adapter.createTaskRequest('EXECUTIVE_BRIEFING', { topic: 'Sprint Status' });
  const context = ProjectContextResolver.resolveContext(profile, req.parameters, { requestId: req.requestId });

  const wfReq = WorkflowRequestBuilder.buildWorkflowRequest(req, context, 'task-sec-101');
  assert(wfReq.projectId === 'AI_SECRETARY', 'ProjectId in WorkflowRequest should be AI_SECRETARY');
  assert(wfReq.taskTitle.includes('EXECUTIVE_BRIEFING'), 'TaskTitle should contain taskType');

  console.log('   ✓ Test 5: Workflow Request Builder: PASSED');
}

// Test 6: ArtifactReference Value Object & Result Builder
function test6_ArtifactReferenceAndResultBuilder() {
  console.log('[Test 6] ArtifactReference Value Object & Result Builder starting...');
  resetEnvironment();

  const artRef = ArtifactReference.of('art-101', 'docs/report.pdf', 'PDF_REPORT');
  assert(artRef.artifactId === 'art-101', 'ArtifactId should match');
  assert(artRef.location === 'docs/report.pdf', 'Location should match');

  const mockInstance: any = {
    instanceId: { getValue: () => 'inst-999' },
    taskId: 'TASK-999',
    workflowName: 'Test Flow',
    status: 'COMPLETED',
    completedAt: new Date().toISOString()
  };

  const mockProgress: any = {
    producedArtifacts: ['output_1.txt', 'output_2.txt']
  };

  const result = ResultBuilder.buildResult('req-777', 'FIELD_OPERATIONS', mockInstance, mockProgress);
  assert(result.completed === true, 'Result should be completed');
  assert(result.producedArtifacts.length === 2, 'Produced ArtifactReferences count should be 2');
  assert(result.producedArtifacts[0] instanceof ArtifactReference, 'Produced item should be ArtifactReference instance');

  console.log('   ✓ Test 6: ArtifactReference Value Object & Result Builder: PASSED');
}

// Test 7: Project Event Model & Publisher
function test7_ProjectEventModelAndPublisher() {
  console.log('[Test 7] Project Event Model & Publisher starting...');
  resetEnvironment();

  const events: any[] = [];
  const unsubscribe = ProjectEventPublisher.subscribe((e) => { events.push(e); });

  ProjectEventPublisher.publish(ProjectEventType.PROJECT_REGISTERED, 'TEST_PROJ', undefined, { name: 'Test' });
  assert(events.length === 1, 'Event listener should receive 1 event');
  assert(events[0].type === ProjectEventType.PROJECT_REGISTERED, 'Event type should match');

  unsubscribe();
  console.log('   ✓ Test 7: Project Event Model & Publisher: PASSED');
}

// Test 8: Hexagonal Project Adapters
function test8_HexagonalProjectAdapters() {
  console.log('[Test 8] Hexagonal Project Adapters starting...');
  resetEnvironment();

  const adapters = [
    StandardProjectCatalog.FIELD_OPERATIONS,
    StandardProjectCatalog.HOKUSEI_CH,
    StandardProjectCatalog.AI_SECRETARY
  ];

  adapters.forEach((adapter) => {
    const profile = adapter.getProfile();
    assert(profile.projectId.getValue() !== '', 'ProjectId should not be empty');
    const req = adapter.createTaskRequest(profile.capability.supportedTaskTypes[0], { test: true });
    assert(req.projectId === profile.projectId.getValue(), 'Request projectId should match adapter profile');
  });

  console.log('   ✓ Test 8: Hexagonal Project Adapters: PASSED');
}

// Test 9: Project Bridge Runtime Execution
function test9_ProjectBridgeRuntimeExecution() {
  console.log('[Test 9] Project Bridge Runtime Execution starting...');
  resetEnvironment();

  BootstrapManager.initialize();

  const bridge = new ProjectBridgeRuntime();
  const adapter = StandardProjectCatalog.FIELD_OPERATIONS;

  let callbackResult: any = null;
  bridge.registerCallback({
    callbackId: 'cb-fieldops',
    projectId: 'FIELD_OPERATIONS',
    onSuccess: (res) => {
      callbackResult = res;
    }
  });

  const request = adapter.createTaskRequest('EXECUTE_FIELD_VERIFICATION', { location: 'Yokkaichi' });
  const { response, result } = bridge.submitTask(request);

  assert(response.status === 'ACCEPTED', 'Response status should be ACCEPTED');
  assert(result !== undefined && result.completed === true, 'Result should be completed');
  assert(callbackResult !== null && callbackResult.taskId === result?.taskId, 'Callback should be invoked with matching result');

  console.log('   ✓ Test 9: Project Bridge Runtime Execution: PASSED');
}

// Test 10: End-to-End Multi-Project Simulation (POSTING MAP / District & 北勢CH / Weather Alert)
function test10_EndToEndMultiProjectSimulation() {
  console.log('[Test 10] End-to-End Multi-Project Simulation starting...');
  resetEnvironment();

  BootstrapManager.initialize();

  const bridge = new ProjectBridgeRuntime();

  // Project A: POSTING MAP (Field Operations / District Initialization)
  const postingMapAdapter = StandardProjectCatalog.FIELD_OPERATIONS;
  const pmReq = postingMapAdapter.createTaskRequest('TERRITORY_INITIALIZATION', {
    district: 'Yokkaichi-Central',
    targetHouses: 5000
  });

  const pmOutput = bridge.submitTask(pmReq);
  assert(pmOutput.response.status === 'ACCEPTED', 'POSTING MAP request should be ACCEPTED');
  assert(pmOutput.result?.completed === true, 'POSTING MAP task should reach COMPLETED status via Project Bridge');
  assert(pmOutput.result?.producedArtifacts.length! >= 5, 'POSTING MAP produced artifacts should be >= 5');

  // Project B: 北勢CH (Weather Alert Publishing)
  const hokuseiAdapter = StandardProjectCatalog.HOKUSEI_CH;
  const hokuseiReq = hokuseiAdapter.createTaskRequest('WEATHER_ALERT_PUBLISH', {
    severity: 'WARNING',
    region: 'Hokusei-Northern-Area',
    mediaType: 'VIDEO'
  });

  const hokuseiOutput = bridge.submitTask(hokuseiReq);
  assert(hokuseiOutput.response.status === 'ACCEPTED', 'Hokusei CH request should be ACCEPTED');
  assert(hokuseiOutput.result?.completed === true, 'Hokusei CH task should reach COMPLETED status via Project Bridge');

  console.log('   ✓ Test 10: End-to-End Multi-Project Simulation: PASSED');
}

async function runAll() {
  console.log('========================================================');
  console.log('TASK-AIOS-013: Project Bridge Foundation Test Suite');
  console.log('========================================================');

  test1_ProjectRegistry();
  test2_ProjectCapabilityAndPolicy();
  test3_ProjectContextResolver();
  test4_TaskIntakeGateway();
  test5_WorkflowRequestBuilder();
  test6_ArtifactReferenceAndResultBuilder();
  test7_ProjectEventModelAndPublisher();
  test8_HexagonalProjectAdapters();
  test9_ProjectBridgeRuntimeExecution();
  test10_EndToEndMultiProjectSimulation();

  console.log('========================================================');
  console.log('ALL PROJECT BRIDGE FOUNDATION TESTS PASSED!');
  console.log('========================================================');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
