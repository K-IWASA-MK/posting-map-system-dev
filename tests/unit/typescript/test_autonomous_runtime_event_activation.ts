/**
 * test_autonomous_runtime_event_activation.ts
 * 
 * AI Employee Autonomous Runtime Activation Event-Driven Test Suite (TASK-AIOS-005)
 */

import { AIEmployeeRegistry } from '../../../sdk/employee/manager/registry/AIEmployeeRegistry';
import { AIEmployeeState } from '../../../sdk/employee/manager/types/AIEmployeeState';
import {
  CapabilityMappingRegistry,
  ExecutionPermissionGate,
  ExecutionPermissionScope,
  ExecutionPlanRegistry,
  ExecutionStepHandlerRegistry,
  ExecutionTaskPriority,
  ExecutionTaskRegistry,
  ExecutionTaskStatus,
  TaskIntakeAuditManager,
  TaskIntakeGateway,
  TaskIntakeRequest
} from '../../../sdk/execution';
import {
  AutonomousCompletionCallbackDispatcher,
  AutonomousRuntimeBootstrap,
  AutonomousRuntimeEventBus,
  AutonomousRuntimeState,
  RuntimeEvent,
  RuntimeEventType,
  TaskCreatedEventPublisher
} from '../../../sdk/runtime';
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

function resetEnvironment() {
  AutonomousRuntimeBootstrap.clear();
  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  ExecutionStepHandlerRegistry.clear();
  TaskIntakeAuditManager.clear();
  CapabilityMappingRegistry.clear();
}

/**
 * Helper to setup a valid AI employee in registry for end-to-end tests
 */
function setupTestEmployee(): AIEmployeeRegistry {
  const registry = new AIEmployeeRegistry();
  const empRecord = registry.registerEmployee({
    employeeId: 'EMP-EVENT-01',
    employeeName: 'Event Driven Activation Agent',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });

  registry.updateState(empRecord.identity.employeeId, AIEmployeeState.IDLE);

  CapabilityMappingRegistry.registerMapping(
    'EMP-EVENT-01',
    [
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.GIT_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.BROWSER_AUTOMATION, status: VerificationCapabilityStatus.AVAILABLE })
    ],
    [
      ExecutionPermissionScope.READ_FILE,
      ExecutionPermissionScope.WRITE_FILE,
      ExecutionPermissionScope.GIT_COMMIT,
      ExecutionPermissionScope.BROWSER_ACTION
    ]
  );

  return registry;
}

// Test 0: Bootstrap Startup Verification
async function test0_BootstrapStartupVerification() {
  console.log('[Test 0] Bootstrap Startup Verification starting...');
  resetEnvironment();

  const registry = setupTestEmployee();
  const state = AutonomousRuntimeBootstrap.start(registry);

  assert(state === AutonomousRuntimeState.READY, 'Bootstrap state should be READY');
  assert(AutonomousRuntimeEventBus.getSubscriberCount(RuntimeEventType.TASK_CREATED) === 1, 'TASK_CREATED subscriber count should be 1');
  assert(AutonomousRuntimeEventBus.getSubscriberCount(RuntimeEventType.TASK_COMPLETED) === 1, 'TASK_COMPLETED subscriber count should be 1');
  assert(AutonomousRuntimeEventBus.getSubscriberCount(RuntimeEventType.TASK_FAILED) === 1, 'TASK_FAILED subscriber count should be 1');
  assert(AutonomousRuntimeEventBus.getSubscriberCount(RuntimeEventType.TASK_BLOCKED) === 1, 'TASK_BLOCKED subscriber count should be 1');

  console.log('   ✓ Test 0: Bootstrap Startup Verification: PASSED');
}

// Test 1: Task Intake -> Event Publishing
async function test1_TaskIntakeEventPublishing() {
  console.log('[Test 1] Task Intake -> Event Publishing starting...');
  resetEnvironment();

  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-EVENT-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Event Publishing Test Task',
    description: 'Verify TaskCreatedEventPublisher publishes TASK_CREATED',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS],
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);
  assert(task.status === ExecutionTaskStatus.CREATED, 'Task status should be CREATED');

  await new Promise((resolve) => setTimeout(resolve, 20));

  const history = AutonomousRuntimeEventBus.getEventHistory();
  assert(history.length === 1, 'EventBus history should contain 1 event');
  assert(history[0].type === RuntimeEventType.TASK_CREATED, 'Published event type should be TASK_CREATED');
  assert(history[0].payload.taskId === task.taskId, 'Event payload taskId should match registered task');

  console.log('   ✓ Test 1: Task Intake -> Event Publishing: PASSED');
}

// Test 2: Event-Driven Orchestration Trigger
async function test2_EventDrivenOrchestrationTrigger() {
  console.log('[Test 2] Event-Driven Orchestration Trigger starting...');
  resetEnvironment();

  const registry = setupTestEmployee();
  AutonomousRuntimeBootstrap.start(registry);

  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-EVENT-002',
    sourceApplication: 'POSTING_MAP',
    title: 'Event-Driven Trigger Task',
    description: 'Verify TASK_CREATED triggers TaskOrchestrationListener',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.BROWSER_AUTOMATION],
    metadata: {
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'a1b2c3d4e5f6'
    },
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);

  // Allow async subscriber resolution & verification execution
  await new Promise((resolve) => setTimeout(resolve, 150));

  const updatedTask = ExecutionTaskRegistry.get(task.taskId);
  assert(updatedTask !== undefined, 'Task should exist in registry');
  assert(updatedTask?.status === ExecutionTaskStatus.COMPLETED, `Task status should be transitioned to COMPLETED by event, got ${updatedTask?.status}`);

  console.log('   ✓ Test 2: Event-Driven Orchestration Trigger: PASSED');
}

// Test 3: End-to-End Orchestration -> Execution -> Verification -> Governance
async function test3_EndToEndAutonomousPipeline() {
  console.log('[Test 3] End-to-End Autonomous Pipeline starting...');
  resetEnvironment();

  const registry = setupTestEmployee();
  AutonomousRuntimeBootstrap.start(registry);

  let callbackReceived: RuntimeEvent | null = null;
  AutonomousCompletionCallbackDispatcher.registerCallback((event) => {
    callbackReceived = event;
  });

  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-EVENT-E2E-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Full Autonomous Pipeline Event Task',
    description: 'Full E2E check via events',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.BROWSER_AUTOMATION],
    metadata: {
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'a1b2c3d4e5f6'
    },
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);

  await new Promise((resolve) => setTimeout(resolve, 150));

  const history = AutonomousRuntimeEventBus.getEventHistory();
  const eventTypes = history.map((e) => e.type);

  assert(eventTypes.includes(RuntimeEventType.TASK_CREATED), 'History should include TASK_CREATED');
  assert(eventTypes.includes(RuntimeEventType.TASK_COMPLETED), 'History should include TASK_COMPLETED');

  console.log('   ✓ Test 3: End-to-End Autonomous Pipeline: PASSED');
}

// Test 4: Completion Event -> Callback Dispatcher
async function test4_CompletionEventCallbackDispatcher() {
  console.log('[Test 4] Completion Event -> Callback Dispatcher starting...');
  resetEnvironment();

  const registry = setupTestEmployee();
  AutonomousRuntimeBootstrap.start(registry);

  const receivedEvents: RuntimeEvent[] = [];
  AutonomousCompletionCallbackDispatcher.registerCallback((event) => {
    receivedEvents.push(event);
  });

  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-EVENT-CALLBACK-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Callback Verification Task',
    description: 'Verify callback receiving TASK_COMPLETED',
    priority: ExecutionTaskPriority.NORMAL,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS, VerificationCapabilityType.BROWSER_AUTOMATION],
    metadata: {
      repository: 'area-management/posting-map-system',
      productionUrl: 'https://area-management.github.io/posting-map-system/',
      expectedCommit: 'a1b2c3d4e5f6'
    },
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);

  await new Promise((resolve) => setTimeout(resolve, 150));

  assert(receivedEvents.length === 1, 'Callback should receive exactly 1 event');
  assert(receivedEvents[0].type === RuntimeEventType.TASK_COMPLETED, 'Callback event type should be TASK_COMPLETED');
  assert((receivedEvents[0].payload as any).taskId === task.taskId, 'Callback payload taskId should match');

  console.log('   ✓ Test 4: Completion Event -> Callback Dispatcher: PASSED');
}

// Test 5: Idempotency / Duplicate Start Prevention
async function test5_IdempotencyDuplicateStartPrevention() {
  console.log('[Test 5] Idempotency / Duplicate Start Prevention starting...');
  resetEnvironment();

  const registry = setupTestEmployee();

  // Call start multiple times
  const state1 = AutonomousRuntimeBootstrap.start(registry);
  const state2 = AutonomousRuntimeBootstrap.start(registry);
  const state3 = AutonomousRuntimeBootstrap.start(registry);

  assert(state1 === AutonomousRuntimeState.READY, 'State 1 should be READY');
  assert(state2 === AutonomousRuntimeState.READY, 'State 2 should be READY');
  assert(state3 === AutonomousRuntimeState.READY, 'State 3 should be READY');

  // Verify subscriber counts have not duplicated
  assert(AutonomousRuntimeEventBus.getSubscriberCount(RuntimeEventType.TASK_CREATED) === 1, 'TASK_CREATED subscriber count should remain 1');
  assert(AutonomousRuntimeEventBus.getSubscriberCount(RuntimeEventType.TASK_COMPLETED) === 1, 'TASK_COMPLETED subscriber count should remain 1');

  console.log('   ✓ Test 5: Idempotency / Duplicate Start Prevention: PASSED');
}

// Test 6: Event Isolation
async function test6_EventIsolation() {
  console.log('[Test 6] Event Isolation starting...');
  resetEnvironment();

  const registry = setupTestEmployee();
  AutonomousRuntimeBootstrap.start(registry);

  const callbackDispatched: RuntimeEvent[] = [];
  AutonomousCompletionCallbackDispatcher.registerCallback((event) => {
    callbackDispatched.push(event);
  });

  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-EVENT-ISOLATION-001',
    sourceApplication: 'POSTING_MAP',
    title: 'Isolation Test Task',
    description: 'Isolation check',
    priority: ExecutionTaskPriority.LOW,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS],
    requestedAt: new Date().toISOString()
  };
  const task = TaskIntakeGateway.submitTask(intakeReq);

  // Check that callback dispatcher received ZERO events from TASK_CREATED directly
  const dispatchedHistory = AutonomousCompletionCallbackDispatcher.getDispatchedHistory();
  // Filter for TASK_CREATED in callback history (should be 0 because Callback Dispatcher handles only COMPLETED/FAILED/BLOCKED)
  const taskCreatedInCallbackHistory = dispatchedHistory.filter((e) => e.type === RuntimeEventType.TASK_CREATED);
  assert(taskCreatedInCallbackHistory.length === 0, 'Callback dispatcher must ignore TASK_CREATED events');

  console.log('   ✓ Test 6: Event Isolation: PASSED');
}

async function runAll() {
  console.log('--- Starting AI Employee Autonomous Runtime Activation Test Suite (TASK-AIOS-005) ---');
  await test0_BootstrapStartupVerification();
  await test1_TaskIntakeEventPublishing();
  await test2_EventDrivenOrchestrationTrigger();
  await test3_EndToEndAutonomousPipeline();
  await test4_CompletionEventCallbackDispatcher();
  await test5_IdempotencyDuplicateStartPrevention();
  await test6_EventIsolation();
  console.log('--- All Autonomous Runtime Activation Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
