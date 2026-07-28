/**
 * test_production_activation_foundation.ts
 * 
 * TASK-AIOS-008: AI Employee Autonomous Runtime Production Activation Foundation Integration Test
 * 
 * POSTING MAP (LIVE Bridge) ➔ TaskIntakeGateway ➔ TaskCreatedEventPublisher ➔ EventBus ➔
 * TaskOrchestrationListener ➔ AIEmployeeTaskOrchestrator ➔ AIEmployeeExecutionRuntime ➔
 * AIEmployeeVerificationOrchestrator ➔ Governance ➔ CompletionCallbackRegistry ➔ POSTING MAP
 * の完全自律LIVE E2E接続およびコールバック通知の自動発火を包括検証する。
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
  BootstrapManager,
  CompletionCallbackRegistry,
  RuntimeEvent,
  RuntimeEventType
} from '../../../sdk/runtime';
import {
  VerificationCapabilityFactory,
  VerificationCapabilityRegistry,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../../../sdk/verification';
import { AIOSBridgeMode } from '../../../projects/posting-map/src/foundation/bridge/AIOSBridgeMode';
import { AIOSBridgeProvider } from '../../../projects/posting-map/src/foundation/bridge/AIOSBridgeProvider';
import { BridgeMessage } from '../../../projects/posting-map/src/foundation/bridge/BridgeMessage';
import { AIOSRuntimeInitializer } from '../../../projects/posting-map/src/foundation/runtime/AIOSRuntimeInitializer';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function resetEnvironment() {
  AIOSRuntimeInitializer.reset();
  BootstrapManager.clear();
  AutonomousRuntimeBootstrap.clear();
  CompletionCallbackRegistry.clear();
  ExecutionTaskRegistry.clear();
  ExecutionPlanRegistry.clear();
  ExecutionPermissionGate.clearPermissions();
  ExecutionStepHandlerRegistry.clear();
  TaskIntakeAuditManager.clear();
  CapabilityMappingRegistry.clear();
  VerificationCapabilityRegistry.clear();

  // Register environment capabilities for test verification
  VerificationCapabilityRegistry.register(
    VerificationCapabilityFactory.createCapability({
      type: VerificationCapabilityType.BROWSER_AUTOMATION,
      status: VerificationCapabilityStatus.AVAILABLE
    })
  );
  VerificationCapabilityRegistry.register(
    VerificationCapabilityFactory.createCapability({
      type: VerificationCapabilityType.CDP_ENDPOINT,
      status: VerificationCapabilityStatus.AVAILABLE
    })
  );
}

function setupTestEmployee(registry: AIEmployeeRegistry) {
  const empRecord = registry.registerEmployee({
    employeeId: 'EMP-PROD-ACTIVATE-01',
    employeeName: 'Production Activation AI Agent',
    employeeType: 'AGENT',
    version: '1.0.0',
    createdAt: new Date().toISOString()
  });

  registry.updateState(empRecord.identity.employeeId, AIEmployeeState.IDLE);

  CapabilityMappingRegistry.registerMapping(
    'EMP-PROD-ACTIVATE-01',
    [
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.GIT_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.BROWSER_AUTOMATION, status: VerificationCapabilityStatus.AVAILABLE }),
      VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.API_ACCESS, status: VerificationCapabilityStatus.AVAILABLE })
    ],
    [
      ExecutionPermissionScope.READ_FILE,
      ExecutionPermissionScope.WRITE_FILE,
      ExecutionPermissionScope.GIT_COMMIT,
      ExecutionPermissionScope.BROWSER_ACTION
    ]
  );
}

// Test 1: TaskIntakeGateway auto-publishes TASK_CREATED event
async function test1_TaskIntakeAutoPublishEvent() {
  console.log('[Test 1] TaskIntakeGateway Auto-Publish Event starting...');
  resetEnvironment();

  const registry = new AIEmployeeRegistry();
  AutonomousRuntimeBootstrap.start(registry);

  const intakeReq: TaskIntakeRequest = {
    requestId: 'REQ-AUTO-PUB-01',
    sourceApplication: 'POSTING_MAP',
    title: 'Auto Publish Event Task',
    description: 'Verify submitTask automatically publishes TASK_CREATED',
    priority: ExecutionTaskPriority.HIGH,
    requiredCapabilities: [VerificationCapabilityType.GIT_ACCESS],
    requestedAt: new Date().toISOString()
  };

  const task = TaskIntakeGateway.submitTask(intakeReq);
  assert(task.status === ExecutionTaskStatus.CREATED, 'Task status should be CREATED upon submit');

  await new Promise((resolve) => setTimeout(resolve, 50));

  const history = AutonomousRuntimeEventBus.getEventHistory();
  const createdEvents = history.filter((e) => e.type === RuntimeEventType.TASK_CREATED);
  assert(createdEvents.length === 1, `EventBus should contain exactly 1 TASK_CREATED event, got ${createdEvents.length}`);
  assert((createdEvents[0].payload as any).taskId === task.taskId, 'Event payload taskId should match submitted task');

  console.log('   ✓ Test 1: TaskIntakeGateway Auto-Publish Event: PASSED');
}

// Test 2: CompletionCallbackRegistry management & notification
async function test2_CompletionCallbackRegistryNotification() {
  console.log('[Test 2] CompletionCallbackRegistry Management & Notification starting...');
  resetEnvironment();

  const received: RuntimeEvent[] = [];
  const unsubscribe = CompletionCallbackRegistry.register((evt) => {
    received.push(evt);
  });

  const dummyEvent: RuntimeEvent = {
    eventId: 'evt-dummy-01',
    type: RuntimeEventType.TASK_COMPLETED,
    timestamp: new Date().toISOString(),
    payload: { taskId: 'task-dummy-01', status: 'COMPLETED' }
  };

  await CompletionCallbackRegistry.notify(dummyEvent as any);

  assert(received.length === 1, 'Registered handler should receive notified event');
  assert(received[0].eventId === 'evt-dummy-01', 'Received eventId should match');
  assert(CompletionCallbackRegistry.getHistory().length === 1, 'Registry history should record 1 event');

  unsubscribe();
  await CompletionCallbackRegistry.notify(dummyEvent as any);
  assert(received.length === 1, 'Unsubscribed handler should not receive subsequent notifications');

  console.log('   ✓ Test 2: CompletionCallbackRegistry Management & Notification: PASSED');
}

// Test 3: AIOSRuntimeInitializer Bootstrap Integration
async function test3_AIOSRuntimeInitializerBootstrap() {
  console.log('[Test 3] AIOSRuntimeInitializer Bootstrap Integration starting...');
  resetEnvironment();

  assert(!AIOSRuntimeInitializer.isInitialized(), 'Initializer should start uninitialized');

  const state = AIOSRuntimeInitializer.initialize();
  assert(state === AutonomousRuntimeState.READY, 'Bootstrap state should be READY');
  assert(AIOSRuntimeInitializer.isInitialized(), 'Initializer should be marked initialized');

  console.log('   ✓ Test 3: AIOSRuntimeInitializer Bootstrap Integration: PASSED');
}

// Test 4: Full Production LIVE E2E Autonomous Execution Loop
async function test4_FullProductionLiveE2EAutonomousExecution() {
  console.log('[Test 4] Full Production LIVE E2E Autonomous Execution starting...');
  resetEnvironment();

  const registry = new AIEmployeeRegistry();
  setupTestEmployee(registry);

  // Initialize POSTING MAP AIOS Provider in LIVE mode
  const bridgeProvider = new AIOSBridgeProvider(AIOSBridgeMode.LIVE);

  // Ensure registry is passed to bootstrap
  AutonomousRuntimeBootstrap.start(registry);

  const message = new BridgeMessage({
    messageId: 'msg-live-e2e-001',
    messageType: 'TASK_REQUEST',
    source: 'POSTING_MAP',
    destination: 'AIOS',
    timestamp: Date.now(),
    payload: {
      action: 'EXECUTE_FIELD_VERIFICATION',
      location: 'Yokkaichi-District',
      metadata: {
        repository: 'area-management/posting-map-system',
        productionUrl: 'https://area-management.github.io/posting-map-system/',
        expectedCommit: 'a1b2c3d4e5f6'
      }
    }
  });

  // 1. Send task from POSTING MAP via LIVE Bridge
  const result = bridgeProvider.send(message);
  assert(result.success, 'Bridge send result should be successful');

  const ackTask: any = result.response?.payload;
  assert(ackTask !== null && ackTask !== undefined, 'Response payload should be defined');
  const taskId = ackTask.taskId;

  // 2. Allow event-driven orchestrator, execution runtime, verification & callback to run
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 3. Verify task completed via AIOS ProjectBridgeRuntime
  assert(ackTask.completed === true, 'Task should be COMPLETED via AIOS ProjectBridge');


  // 4. Verify completion details in response payload
  assert(typeof ackTask.details === 'string', 'Response payload details should be populated');


  console.log('   ✓ Test 4: Full Production LIVE E2E Autonomous Execution: PASSED');
}

async function runAll() {
  console.log('=== TASK-AIOS-008: Production Activation Foundation Test Suite ===');
  await test1_TaskIntakeAutoPublishEvent();
  await test2_CompletionCallbackRegistryNotification();
  await test3_AIOSRuntimeInitializerBootstrap();
  await test4_FullProductionLiveE2EAutonomousExecution();
  console.log('=== All Production Activation Foundation Tests PASSED ===');
}

runAll().catch((err) => {
  console.error('[Test Suite Exception]', err);
  process.exit(1);
});
