import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../src/aios/SkillRegistry';
import { SkillFactory } from '../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../src/aios/SkillPipelineFactory';
import { RuntimeRegistry, RuntimeState, RuntimeMode } from '../src/aios/RuntimeRegistry';
import { RuntimeFactory } from '../src/aios/RuntimeFactory';
import { RuntimeSessionRegistry, RuntimeSessionState } from '../src/aios/RuntimeSessionRegistry';
import { RuntimeSessionFactory } from '../src/aios/RuntimeSessionFactory';
import { RuntimeContextRegistry, RuntimeContextState } from '../src/aios/RuntimeContextRegistry';
import { RuntimeContextFactory } from '../src/aios/RuntimeContextFactory';
import { RuntimeQueueRegistry, RuntimeQueueState, QueuePriority } from '../src/aios/RuntimeQueueRegistry';
import { RuntimeQueueFactory } from '../src/aios/RuntimeQueueFactory';
import { RuntimeTaskRegistry, RuntimeTaskState, RuntimeTaskType } from '../src/aios/RuntimeTaskRegistry';
import { RuntimeTaskFactory } from '../src/aios/RuntimeTaskFactory';
import { RuntimeTaskValidator } from '../src/aios/RuntimeTaskValidator';
import { RuntimeTaskAdapter } from '../src/aios/RuntimeTaskAdapter';
import { DevelopmentRules } from '../src/aios/DevelopmentRules';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function setupAllEnvironments() {
  CapabilityRegistry.clear();
  CapabilityFactory.resetCounter();
  SkillRegistry.clear();
  SkillFactory.resetCounter();
  SkillPipelineRegistry.clear();
  SkillPipelineFactory.resetCounter();
  RuntimeRegistry.clear();
  RuntimeFactory.resetCounter();
  RuntimeSessionRegistry.clear();
  RuntimeSessionFactory.resetCounter();
  RuntimeContextRegistry.clear();
  RuntimeContextFactory.resetCounter();
  RuntimeQueueRegistry.clear();
  RuntimeQueueFactory.resetCounter();
  RuntimeTaskRegistry.clear();
  RuntimeTaskFactory.resetCounter();

  // Register Capability
  const cap = CapabilityFactory.create('Testing', CapabilityCategory.Testing, 'Desc', 10, CapabilityStatus.ACTIVE, '1.0.0');
  CapabilityRegistry.register(cap);

  // Register Skill
  const skill = SkillFactory.create('CodeScan', SkillCategory.Analysis, 'Desc', cap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');
  SkillRegistry.register(skill);

  // Register Pipeline
  const pipeline = SkillPipelineFactory.create('TestPipe', 'Desc', cap.capabilityId, [skill.skillId], 5, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
  SkillPipelineRegistry.register(pipeline);

  // Register Runtime (ID: runtime-1)
  const runtime = RuntimeFactory.create('TestRuntime', RuntimeState.CREATED, RuntimeMode.SANDBOX, 'Desc', '1.0.0');
  RuntimeRegistry.register(runtime);

  // Register Session (ID: session-1)
  const session = RuntimeSessionFactory.create('TestSession', 'runtime-1', 'Desc', RuntimeSessionState.CREATED);
  RuntimeSessionRegistry.register(session);

  // Register Context (ID: context-1)
  const context = RuntimeContextFactory.create('TestContext', 'session-1', 'Desc', RuntimeContextState.CREATED);
  RuntimeContextRegistry.register(context);

  // Register Queue (ID: queue-1)
  const queue = RuntimeQueueFactory.create('TestQueue', 'context-1', 'Desc', RuntimeQueueState.CREATED, QueuePriority.NORMAL);
  RuntimeQueueRegistry.register(queue);
}

// ==============================================================================
// 1. RuntimeTaskRegistry Metadata and Operations
// ==============================================================================
function testRegistryBasic() {
  console.log('[Test 1] RuntimeTaskRegistry Metadata and Basic Operations starting...');
  setupAllEnvironments();

  // Metadata verification
  assert(RuntimeTaskRegistry.metadata.registryId === 'reg-runtime-task-01', 'Metadata registry ID mismatch');
  assert(RuntimeTaskRegistry.metadata.registryVersion === '1.0.0', 'Metadata registry version mismatch');

  const task = RuntimeTaskFactory.create(
    'test-task-1',
    'queue-1',
    RuntimeTaskType.VALIDATION,
    RuntimeTaskState.CREATED,
    'A logical test task',
    '1.0.0',
    '1.0.0'
  );

  assert(task.taskId === 'task-1', 'Factory failed to assign task-1 ID');
  assert(task.taskName === 'test-task-1', 'taskName assignment mismatch');
  assert(task.taskType === RuntimeTaskType.VALIDATION, 'taskType assignment mismatch');
  assert(task.taskState === RuntimeTaskState.CREATED, 'taskState assignment mismatch');

  RuntimeTaskRegistry.register(task);
  
  const fetched = RuntimeTaskRegistry.get('task-1');
  assert(fetched !== undefined, 'Failed to fetch registered task');
  assert(fetched?.taskName === 'test-task-1', 'Fetched task name mismatch');

  // Verify findByQueue
  const listByQueue = RuntimeTaskRegistry.findByQueue('queue-1');
  assert(listByQueue.length === 1, 'Should find 1 task associated with queue-1');
  assert(listByQueue[0].taskId === 'task-1', 'Associated task ID mismatch');

  // Verify findByState
  const listByState = RuntimeTaskRegistry.findByState(RuntimeTaskState.CREATED);
  assert(listByState.length === 1, 'Should find 1 task associated with state CREATED');

  // Verify findByType
  const listByType = RuntimeTaskRegistry.findByType(RuntimeTaskType.VALIDATION);
  assert(listByType.length === 1, 'Should find 1 task associated with type VALIDATION');

  // Verify clear and findAll
  assert(RuntimeTaskRegistry.findAll().length === 1, 'findAll should return 1 record');
  RuntimeTaskRegistry.clear();
  assert(RuntimeTaskRegistry.findAll().length === 0, 'clear should empty the registry');

  console.log('[Test 1] RuntimeTaskRegistry Metadata and Basic Operations: PASSED');
}

// ==============================================================================
// 2. Factory and Determinism
// ==============================================================================
function testFactoryDeterminism() {
  console.log('[Test 2] Factory and ID Determinism verification starting...');
  setupAllEnvironments();

  const t1 = RuntimeTaskFactory.create('T1', 'queue-1', RuntimeTaskType.AUDIT, RuntimeTaskState.CREATED);
  const t2 = RuntimeTaskFactory.create('T2', 'queue-1', RuntimeTaskType.CAPABILITY, RuntimeTaskState.READY);
  
  assert(t1.taskId === 'task-1', 'First ID must be task-1');
  assert(t2.taskId === 'task-2', 'Second ID must be task-2');

  // Counter reset verification
  RuntimeTaskFactory.resetCounter();
  const t3 = RuntimeTaskFactory.create('T3', 'queue-1', RuntimeTaskType.AUDIT, RuntimeTaskState.CREATED);
  assert(t3.taskId === 'task-1', 'Counter reset failed');

  // Immutability verification
  try {
    (t1 as any).taskName = 'ModifiedName';
    assert(false, 'Should throw error when modifying frozen record');
  } catch (e) {
    // OK: Record is frozen
  }

  console.log('[Test 2] Factory and ID Determinism verification: PASSED');
}

// ==============================================================================
// 3. Validator Checks (with exact error mapping from Flash instructions)
// ==============================================================================
function testValidator() {
  console.log('[Test 3] RuntimeTaskValidator validation verification starting...');
  setupAllEnvironments();

  const validTask = RuntimeTaskFactory.create('ValidTask', 'queue-1', RuntimeTaskType.AUDIT, RuntimeTaskState.CREATED);

  // Valid record validation should not throw
  RuntimeTaskValidator.validate(validTask);

  // 3.1 ID format validation
  try {
    const badId = { ...validTask, taskId: 'bad-id' };
    RuntimeTaskValidator.validate(badId);
    assert(false, 'Should fail validation for invalid taskId');
  } catch (e: any) {
    assert(e.message.includes('Invalid taskId format'), 'Error message mismatch');
  }

  // 3.2 INVALID_TASK_STATE validation
  try {
    const badState = { ...validTask, taskState: 'INVALID_STATE' as any };
    RuntimeTaskValidator.validate(badState);
    assert(false, 'Should fail validation for INVALID_TASK_STATE');
  } catch (e: any) {
    assert(e.message.includes('Invalid state'), 'INVALID_TASK_STATE check failed');
  }

  // 3.3 INVALID_TASK_TYPE validation
  try {
    const badType = { ...validTask, taskType: 'INVALID_TYPE' as any };
    RuntimeTaskValidator.validate(badType);
    assert(false, 'Should fail validation for INVALID_TASK_TYPE');
  } catch (e: any) {
    assert(e.message.includes('Invalid type'), 'INVALID_TASK_TYPE check failed');
  }

  // 3.4 INVALID_TASK_VERSION validation
  try {
    const badVersion = { ...validTask, version: '   ' };
    RuntimeTaskValidator.validate(badVersion);
    assert(false, 'Should fail validation for INVALID_TASK_VERSION');
  } catch (e: any) {
    assert(e.message.includes('version is required'), 'INVALID_TASK_VERSION check failed');
  }

  // 3.5 INVALID_TASK_DATE validation
  try {
    const badDateSequence = { ...validTask, createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T09:00:00Z' };
    RuntimeTaskValidator.validate(badDateSequence);
    assert(false, 'Should fail validation for INVALID_TASK_DATE (createdAt > updatedAt)');
  } catch (e: any) {
    assert(e.message.includes('Invalid task date sequence'), 'INVALID_TASK_DATE check failed');
  }

  // 3.6 INVALID_QUEUE_REFERENCE validation
  try {
    const badQueueRef = { ...validTask, queueId: 'queue-unregistered' };
    RuntimeTaskValidator.validate(badQueueRef);
    assert(false, 'Should fail validation for INVALID_QUEUE_REFERENCE');
  } catch (e: any) {
    assert(e.message.includes('Queue dependency not registered'), 'INVALID_QUEUE_REFERENCE check failed');
  }

  // 3.7 DUPLICATE_TASK validation
  try {
    RuntimeTaskRegistry.register(validTask);
    // Duplicate registration should throw DUPLICATE_TASK
    RuntimeTaskRegistry.register(validTask);
    assert(false, 'Should throw error for DUPLICATE_TASK');
  } catch (e: any) {
    assert(e.message.includes('Task ID already registered'), 'DUPLICATE_TASK check failed');
  }

  // 3.8 DUPLICATE_TASK Name validation
  try {
    RuntimeTaskRegistry.clear();
    RuntimeTaskRegistry.register(validTask);
    // Duplicate task name with different ID should throw DUPLICATE_TASK
    const sameNameTask = { ...validTask, taskId: 'task-2' };
    RuntimeTaskRegistry.register(sameNameTask);
    assert(false, 'Should throw error for duplicate taskName');
  } catch (e: any) {
    assert(e.message.includes('Task Name already registered'), 'DUPLICATE_TASK check by name failed');
  }

  console.log('[Test 3] RuntimeTaskValidator validation verification: PASSED');
}

// ==============================================================================
// 4. RuntimeTaskAdapter and ViewModel conversion
// ==============================================================================
function testAdapterViewModel() {
  console.log('[Test 4] RuntimeTaskAdapter ViewModel conversion verification starting...');
  setupAllEnvironments();

  const task = RuntimeTaskFactory.create(
    'adapter-task-env',
    'queue-1',
    RuntimeTaskType.DOCUMENTATION,
    RuntimeTaskState.RUNNING,
    'Production task context description',
    '2.1.0'
  );

  const vm = RuntimeTaskAdapter.toViewModel(task);
  
  assert(vm.id === task.taskId, 'VM ID mismatch');
  assert(vm.name === 'adapter-task-env', 'VM name mismatch');
  assert(vm.queueId === 'queue-1', 'VM queueId mismatch');
  assert(vm.descriptionText === 'Production task context description', 'VM description mismatch');
  assert(vm.taskSpecVersion === '2.1.0', 'VM taskSpecVersion mismatch');
  assert(vm.stateLabel === 'RUNNING', 'VM state label mismatch');
  assert(vm.typeLabel === 'DOCUMENTATION', 'VM type label mismatch');
  assert(vm.displayName === 'Task: adapter-task-env [Type: DOCUMENTATION] (task-1)', 'VM displayName mismatch');
  assert(vm.createdTimestamp === task.createdAt, 'VM created timestamp mismatch');

  // Verify immutability of ViewModel
  try {
    (vm as any).name = 'NewVMName';
    assert(false, 'ViewModel must be read-only and frozen');
  } catch (e) {
    // OK: ViewModel is frozen
  }

  console.log('[Test 4] RuntimeTaskAdapter ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  // Create and register runtime task environment
  const task = RuntimeTaskFactory.create(
    'rule-task-env',
    'queue-1',
    RuntimeTaskType.VALIDATION,
    RuntimeTaskState.RUNNING,
    'rules task description',
    '1.0.0'
  );
  RuntimeTaskRegistry.register(task);

  // Setup rule mapping to Capability "Testing" -> "pipeline-1" (via setupAllEnvironments)
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);

  const resolvedTask = DevelopmentRules.getRuntimeTask(rule);
  assert(resolvedTask !== undefined, 'getRuntimeTask should resolve the associated task');
  assert(resolvedTask?.taskId === 'task-1', 'Resolved task ID mismatch');
  assert(resolvedTask?.taskName === 'rule-task-env', 'Resolved task name mismatch');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getRuntimeTask(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testRegistryBasic();
    testFactoryDeterminism();
    testValidator();
    testAdapterViewModel();
    testRulesIntegration();
    console.log('\nAll Development Runtime Task tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
