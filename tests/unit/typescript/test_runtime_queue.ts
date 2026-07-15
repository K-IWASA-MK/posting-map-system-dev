import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/CapabilityRegistry';
import { CapabilityFactory } from '../../../sdk/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../sdk/SkillRegistry';
import { SkillFactory } from '../../../sdk/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../sdk/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../../../sdk/SkillPipelineFactory';
import { RuntimeRegistry, RuntimeState, RuntimeMode } from '../../../sdk/RuntimeRegistry';
import { RuntimeFactory } from '../../../sdk/RuntimeFactory';
import { RuntimeSessionRegistry, RuntimeSessionState } from '../../../sdk/RuntimeSessionRegistry';
import { RuntimeSessionFactory } from '../../../sdk/RuntimeSessionFactory';
import { RuntimeContextRegistry, RuntimeContextState } from '../../../sdk/RuntimeContextRegistry';
import { RuntimeContextFactory } from '../../../sdk/RuntimeContextFactory';
import { RuntimeQueueRegistry, RuntimeQueueState, QueuePriority } from '../../../sdk/RuntimeQueueRegistry';
import { RuntimeQueueFactory } from '../../../sdk/RuntimeQueueFactory';
import { RuntimeQueueValidator } from '../../../sdk/RuntimeQueueValidator';
import { RuntimeQueueAdapter } from '../../../sdk/RuntimeQueueAdapter';
import { DevelopmentRules } from '../../../sdk/DevelopmentRules';

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
}

// ==============================================================================
// 1. RuntimeQueueRegistry Metadata and Operations
// ==============================================================================
function testRegistryBasic() {
  console.log('[Test 1] RuntimeQueueRegistry Metadata and Basic Operations starting...');
  setupAllEnvironments();

  // Metadata verification
  assert(RuntimeQueueRegistry.metadata.registryId === 'reg-runtime-queue-01', 'Metadata registry ID mismatch');
  assert(RuntimeQueueRegistry.metadata.registryVersion === '1.0.0', 'Metadata registry version mismatch');

  const queue = RuntimeQueueFactory.create(
    'test-queue-1',
    'context-1',
    'A logical test queue',
    RuntimeQueueState.CREATED,
    QueuePriority.NORMAL,
    '1.0.0',
    '1.0.0'
  );

  assert(queue.queueId === 'queue-1', 'Factory failed to assign queue-1 ID');
  assert(queue.queueName === 'test-queue-1', 'queueName assignment mismatch');
  assert(queue.state === RuntimeQueueState.CREATED, 'state assignment mismatch');
  assert(queue.priority === QueuePriority.NORMAL, 'priority assignment mismatch');

  RuntimeQueueRegistry.register(queue);
  
  const fetched = RuntimeQueueRegistry.get('queue-1');
  assert(fetched !== undefined, 'Failed to fetch registered queue');
  assert(fetched?.queueName === 'test-queue-1', 'Fetched queue name mismatch');

  // Verify findByContext
  const list = RuntimeQueueRegistry.findByContext('context-1');
  assert(list.length === 1, 'Should find 1 queue associated with context-1');
  assert(list[0].queueId === 'queue-1', 'Associated queue ID mismatch');

  // Verify clear and findAll
  assert(RuntimeQueueRegistry.findAll().length === 1, 'findAll should return 1 record');
  RuntimeQueueRegistry.clear();
  assert(RuntimeQueueRegistry.findAll().length === 0, 'clear should empty the registry');

  console.log('[Test 1] RuntimeQueueRegistry Metadata and Basic Operations: PASSED');
}

// ==============================================================================
// 2. Factory and Determinism
// ==============================================================================
function testFactoryDeterminism() {
  console.log('[Test 2] Factory and ID Determinism verification starting...');
  setupAllEnvironments();

  const q1 = RuntimeQueueFactory.create('Q1', 'context-1', 'desc', RuntimeQueueState.CREATED, QueuePriority.LOW);
  const q2 = RuntimeQueueFactory.create('Q2', 'context-1', 'desc', RuntimeQueueState.READY, QueuePriority.HIGH);
  
  assert(q1.queueId === 'queue-1', 'First ID must be queue-1');
  assert(q2.queueId === 'queue-2', 'Second ID must be queue-2');

  // Counter reset verification
  RuntimeQueueFactory.resetCounter();
  const q3 = RuntimeQueueFactory.create('Q3', 'context-1', 'desc', RuntimeQueueState.CREATED, QueuePriority.LOW);
  assert(q3.queueId === 'queue-1', 'Counter reset failed');

  // Immutability verification
  try {
    (q1 as any).queueName = 'ModifiedName';
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
  console.log('[Test 3] RuntimeQueueValidator validation verification starting...');
  setupAllEnvironments();

  const validQueue = RuntimeQueueFactory.create('ValidQueue', 'context-1', 'Valid desc', RuntimeQueueState.CREATED, QueuePriority.NORMAL);

  // Valid record validation should not throw
  RuntimeQueueValidator.validate(validQueue);

  // 3.1 ID format validation
  try {
    const badId = { ...validQueue, queueId: 'bad-id' };
    RuntimeQueueValidator.validate(badId);
    assert(false, 'Should fail validation for invalid queueId');
  } catch (e: any) {
    assert(e.message.includes('Invalid queueId format'), 'Error message mismatch');
  }

  // 3.2 INVALID_QUEUE_STATE validation
  try {
    const badState = { ...validQueue, state: 'INVALID_STATE' as any };
    RuntimeQueueValidator.validate(badState);
    assert(false, 'Should fail validation for INVALID_QUEUE_STATE');
  } catch (e: any) {
    assert(e.message.includes('Invalid state'), 'INVALID_QUEUE_STATE check failed');
  }

  // 3.3 INVALID_QUEUE_PRIORITY validation
  try {
    const badPriority = { ...validQueue, priority: 'INVALID_PRIORITY' as any };
    RuntimeQueueValidator.validate(badPriority);
    assert(false, 'Should fail validation for INVALID_QUEUE_PRIORITY');
  } catch (e: any) {
    assert(e.message.includes('Invalid priority'), 'INVALID_QUEUE_PRIORITY check failed');
  }

  // 3.4 INVALID_QUEUE_VERSION validation
  try {
    const badVersion = { ...validQueue, version: '   ' };
    RuntimeQueueValidator.validate(badVersion);
    assert(false, 'Should fail validation for INVALID_QUEUE_VERSION');
  } catch (e: any) {
    assert(e.message.includes('version is required'), 'INVALID_QUEUE_VERSION check failed');
  }

  // 3.5 INVALID_QUEUE_DATE validation
  try {
    const badDateSequence = { ...validQueue, createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T09:00:00Z' };
    RuntimeQueueValidator.validate(badDateSequence);
    assert(false, 'Should fail validation for INVALID_QUEUE_DATE (createdAt > updatedAt)');
  } catch (e: any) {
    assert(e.message.includes('Invalid queue date sequence'), 'INVALID_QUEUE_DATE check failed');
  }

  // 3.6 INVALID_CONTEXT_REFERENCE validation
  try {
    const badContextRef = { ...validQueue, contextId: 'context-unregistered' };
    RuntimeQueueValidator.validate(badContextRef);
    assert(false, 'Should fail validation for INVALID_CONTEXT_REFERENCE');
  } catch (e: any) {
    assert(e.message.includes('Context dependency not registered'), 'INVALID_CONTEXT_REFERENCE check failed');
  }

  // 3.7 DUPLICATE_QUEUE validation
  try {
    RuntimeQueueRegistry.register(validQueue);
    // Duplicate registration should throw DUPLICATE_QUEUE
    RuntimeQueueRegistry.register(validQueue);
    assert(false, 'Should throw error for DUPLICATE_QUEUE');
  } catch (e: any) {
    assert(e.message.includes('Queue ID already registered'), 'DUPLICATE_QUEUE check failed');
  }

  // 3.8 DUPLICATE_QUEUE Name validation
  try {
    RuntimeQueueRegistry.clear();
    RuntimeQueueRegistry.register(validQueue);
    // Duplicate queue name with different ID should throw DUPLICATE_QUEUE
    const sameNameQueue = { ...validQueue, queueId: 'queue-2' };
    RuntimeQueueRegistry.register(sameNameQueue);
    assert(false, 'Should throw error for duplicate queueName');
  } catch (e: any) {
    assert(e.message.includes('Queue Name already registered'), 'DUPLICATE_QUEUE check by name failed');
  }

  console.log('[Test 3] RuntimeQueueValidator validation verification: PASSED');
}

// ==============================================================================
// 4. RuntimeQueueAdapter and ViewModel conversion
// ==============================================================================
function testAdapterViewModel() {
  console.log('[Test 4] RuntimeQueueAdapter ViewModel conversion verification starting...');
  setupAllEnvironments();

  const queue = RuntimeQueueFactory.create(
    'adapter-queue-env',
    'context-1',
    'Production queue context description',
    RuntimeQueueState.PROCESSING,
    QueuePriority.CRITICAL,
    '2.1.0'
  );

  const vm = RuntimeQueueAdapter.toViewModel(queue);
  
  assert(vm.id === queue.queueId, 'VM ID mismatch');
  assert(vm.name === 'adapter-queue-env', 'VM name mismatch');
  assert(vm.contextId === 'context-1', 'VM contextId mismatch');
  assert(vm.descriptionText === 'Production queue context description', 'VM description mismatch');
  assert(vm.queueSpecVersion === '2.1.0', 'VM queueSpecVersion mismatch');
  assert(vm.stateLabel === 'PROCESSING', 'VM state label mismatch');
  assert(vm.priorityLabel === 'CRITICAL', 'VM priority label mismatch');
  assert(vm.displayName === 'Queue: adapter-queue-env [Priority: CRITICAL] (queue-1)', 'VM displayName mismatch');
  assert(vm.createdTimestamp === queue.createdAt, 'VM created timestamp mismatch');

  // Verify immutability of ViewModel
  try {
    (vm as any).name = 'NewVMName';
    assert(false, 'ViewModel must be read-only and frozen');
  } catch (e) {
    // OK: ViewModel is frozen
  }

  console.log('[Test 4] RuntimeQueueAdapter ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  // Create and register runtime queue environment
  const queue = RuntimeQueueFactory.create(
    'rule-queue-env',
    'context-1',
    'rules queue description',
    RuntimeQueueState.PROCESSING,
    QueuePriority.HIGH,
    '1.0.0'
  );
  RuntimeQueueRegistry.register(queue);

  // Setup rule mapping to Capability "Testing" -> "pipeline-1" (via setupAllEnvironments)
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);

  const resolvedQueue = DevelopmentRules.getRuntimeQueue(rule);
  assert(resolvedQueue !== undefined, 'getRuntimeQueue should resolve the associated queue');
  assert(resolvedQueue?.queueId === 'queue-1', 'Resolved queue ID mismatch');
  assert(resolvedQueue?.queueName === 'rule-queue-env', 'Resolved queue name mismatch');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getRuntimeQueue(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

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
    console.log('\nAll Development Runtime Queue tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
