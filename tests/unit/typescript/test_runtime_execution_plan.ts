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
import { RuntimeTaskRegistry, RuntimeTaskState, RuntimeTaskType } from '../../../sdk/RuntimeTaskRegistry';
import { RuntimeTaskFactory } from '../../../sdk/RuntimeTaskFactory';
import { RuntimeExecutionPlanRegistry, RuntimeExecutionPlanState, ExecutionStrategy } from '../../../sdk/RuntimeExecutionPlanRegistry';
import { RuntimeExecutionPlanFactory } from '../../../sdk/RuntimeExecutionPlanFactory';
import { RuntimeExecutionPlanValidator } from '../../../sdk/RuntimeExecutionPlanValidator';
import { RuntimeExecutionPlanAdapter } from '../../../sdk/RuntimeExecutionPlanAdapter';
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
  RuntimeTaskRegistry.clear();
  RuntimeTaskFactory.resetCounter();
  RuntimeExecutionPlanRegistry.clear();
  RuntimeExecutionPlanFactory.resetCounter();

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

  // Register Task (ID: task-1)
  const task = RuntimeTaskFactory.create('TestTask', 'queue-1', RuntimeTaskType.VALIDATION, RuntimeTaskState.CREATED);
  RuntimeTaskRegistry.register(task);
}

// ==============================================================================
// 1. RuntimeExecutionPlanRegistry Metadata and Operations
// ==============================================================================
function testRegistryBasic() {
  console.log('[Test 1] RuntimeExecutionPlanRegistry Metadata and Basic Operations starting...');
  setupAllEnvironments();

  // Metadata verification
  assert(RuntimeExecutionPlanRegistry.metadata.registryId === 'reg-runtime-execution-plan-01', 'Metadata registry ID mismatch');
  assert(RuntimeExecutionPlanRegistry.metadata.registryVersion === '1.0.0', 'Metadata registry version mismatch');

  const plan = RuntimeExecutionPlanFactory.create(
    'test-plan-1',
    'task-1',
    ExecutionStrategy.SEQUENTIAL,
    RuntimeExecutionPlanState.CREATED,
    'A logical test plan',
    '1.0.0',
    '1.0.0'
  );

  assert(plan.planId === 'plan-1', 'Factory failed to assign plan-1 ID');
  assert(plan.planName === 'test-plan-1', 'planName assignment mismatch');
  assert(plan.executionStrategy === ExecutionStrategy.SEQUENTIAL, 'executionStrategy assignment mismatch');
  assert(plan.planState === RuntimeExecutionPlanState.CREATED, 'planState assignment mismatch');

  RuntimeExecutionPlanRegistry.register(plan);
  
  const fetched = RuntimeExecutionPlanRegistry.get('plan-1');
  assert(fetched !== undefined, 'Failed to fetch registered plan');
  assert(fetched?.planName === 'test-plan-1', 'Fetched plan name mismatch');

  // Verify findByTask
  const listByTask = RuntimeExecutionPlanRegistry.findByTask('task-1');
  assert(listByTask.length === 1, 'Should find 1 plan associated with task-1');
  assert(listByTask[0].planId === 'plan-1', 'Associated plan ID mismatch');

  // Verify findByState
  const listByState = RuntimeExecutionPlanRegistry.findByState(RuntimeExecutionPlanState.CREATED);
  assert(listByState.length === 1, 'Should find 1 plan associated with state CREATED');

  // Verify findByStrategy
  const listByStrategy = RuntimeExecutionPlanRegistry.findByStrategy(ExecutionStrategy.SEQUENTIAL);
  assert(listByStrategy.length === 1, 'Should find 1 plan associated with strategy SEQUENTIAL');

  // Verify clear and findAll
  assert(RuntimeExecutionPlanRegistry.findAll().length === 1, 'findAll should return 1 record');
  RuntimeExecutionPlanRegistry.clear();
  assert(RuntimeExecutionPlanRegistry.findAll().length === 0, 'clear should empty the registry');

  console.log('[Test 1] RuntimeExecutionPlanRegistry Metadata and Basic Operations: PASSED');
}

// ==============================================================================
// 2. Factory and Determinism
// ==============================================================================
function testFactoryDeterminism() {
  console.log('[Test 2] Factory and ID Determinism verification starting...');
  setupAllEnvironments();

  const p1 = RuntimeExecutionPlanFactory.create('P1', 'task-1', ExecutionStrategy.PARALLEL, RuntimeExecutionPlanState.CREATED);
  const p2 = RuntimeExecutionPlanFactory.create('P2', 'task-1', ExecutionStrategy.CONDITIONAL, RuntimeExecutionPlanState.READY);
  
  assert(p1.planId === 'plan-1', 'First ID must be plan-1');
  assert(p2.planId === 'plan-2', 'Second ID must be plan-2');

  // Counter reset verification
  RuntimeExecutionPlanFactory.resetCounter();
  const p3 = RuntimeExecutionPlanFactory.create('P3', 'task-1', ExecutionStrategy.PARALLEL, RuntimeExecutionPlanState.CREATED);
  assert(p3.planId === 'plan-1', 'Counter reset failed');

  // Immutability verification
  try {
    (p1 as any).planName = 'ModifiedName';
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
  console.log('[Test 3] RuntimeExecutionPlanValidator validation verification starting...');
  setupAllEnvironments();

  const validPlan = RuntimeExecutionPlanFactory.create('ValidPlan', 'task-1', ExecutionStrategy.SEQUENTIAL, RuntimeExecutionPlanState.CREATED);

  // Valid record validation should not throw
  RuntimeExecutionPlanValidator.validate(validPlan);

  // 3.1 ID format validation
  try {
    const badId = { ...validPlan, planId: 'bad-id' };
    RuntimeExecutionPlanValidator.validate(badId);
    assert(false, 'Should fail validation for invalid planId');
  } catch (e: any) {
    assert(e.message.includes('Invalid planId format'), 'Error message mismatch');
  }

  // 3.2 INVALID_PLAN_STATE validation
  try {
    const badState = { ...validPlan, planState: 'INVALID_STATE' as any };
    RuntimeExecutionPlanValidator.validate(badState);
    assert(false, 'Should fail validation for INVALID_PLAN_STATE');
  } catch (e: any) {
    assert(e.message.includes('Invalid planState'), 'INVALID_PLAN_STATE check failed');
  }

  // 3.3 INVALID_EXECUTION_STRATEGY validation
  try {
    const badStrategy = { ...validPlan, executionStrategy: 'INVALID_STRATEGY' as any };
    RuntimeExecutionPlanValidator.validate(badStrategy);
    assert(false, 'Should fail validation for INVALID_EXECUTION_STRATEGY');
  } catch (e: any) {
    assert(e.message.includes('Invalid executionStrategy'), 'INVALID_EXECUTION_STRATEGY check failed');
  }

  // 3.4 INVALID_PLAN_VERSION validation
  try {
    const badVersion = { ...validPlan, version: '   ' };
    RuntimeExecutionPlanValidator.validate(badVersion);
    assert(false, 'Should fail validation for INVALID_PLAN_VERSION');
  } catch (e: any) {
    assert(e.message.includes('version is required'), 'INVALID_PLAN_VERSION check failed');
  }

  // 3.5 INVALID_PLAN_DATE validation
  try {
    const badDateSequence = { ...validPlan, createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T09:00:00Z' };
    RuntimeExecutionPlanValidator.validate(badDateSequence);
    assert(false, 'Should fail validation for INVALID_PLAN_DATE (createdAt > updatedAt)');
  } catch (e: any) {
    assert(e.message.includes('Invalid plan date sequence'), 'INVALID_PLAN_DATE check failed');
  }

  // 3.6 INVALID_TASK_REFERENCE validation
  try {
    const badTaskRef = { ...validPlan, taskId: 'task-unregistered' };
    RuntimeExecutionPlanValidator.validate(badTaskRef);
    assert(false, 'Should fail validation for INVALID_TASK_REFERENCE');
  } catch (e: any) {
    assert(e.message.includes('Task dependency not registered'), 'INVALID_TASK_REFERENCE check failed');
  }

  // 3.7 DUPLICATE_PLAN validation
  try {
    RuntimeExecutionPlanRegistry.register(validPlan);
    // Duplicate registration should throw DUPLICATE_PLAN
    RuntimeExecutionPlanRegistry.register(validPlan);
    assert(false, 'Should throw error for DUPLICATE_PLAN');
  } catch (e: any) {
    assert(e.message.includes('ExecutionPlan ID already registered'), 'DUPLICATE_PLAN check failed');
  }

  // 3.8 DUPLICATE_PLAN Name validation
  try {
    RuntimeExecutionPlanRegistry.clear();
    RuntimeExecutionPlanRegistry.register(validPlan);
    // Duplicate plan name with different ID should throw DUPLICATE_PLAN
    const sameNamePlan = { ...validPlan, planId: 'plan-2' };
    RuntimeExecutionPlanRegistry.register(sameNamePlan);
    assert(false, 'Should throw error for duplicate planName');
  } catch (e: any) {
    assert(e.message.includes('ExecutionPlan Name already registered'), 'DUPLICATE_PLAN check by name failed');
  }

  console.log('[Test 3] RuntimeExecutionPlanValidator validation verification: PASSED');
}

// ==============================================================================
// 4. RuntimeExecutionPlanAdapter and ViewModel conversion
// ==============================================================================
function testAdapterViewModel() {
  console.log('[Test 4] RuntimeExecutionPlanAdapter ViewModel conversion verification starting...');
  setupAllEnvironments();

  const plan = RuntimeExecutionPlanFactory.create(
    'adapter-plan-env',
    'task-1',
    ExecutionStrategy.MANUAL,
    RuntimeExecutionPlanState.EXECUTING,
    'Production plan context description',
    '2.1.0'
  );

  const vm = RuntimeExecutionPlanAdapter.toViewModel(plan);
  
  assert(vm.id === plan.planId, 'VM ID mismatch');
  assert(vm.name === 'adapter-plan-env', 'VM name mismatch');
  assert(vm.taskId === 'task-1', 'VM taskId mismatch');
  assert(vm.descriptionText === 'Production plan context description', 'VM description mismatch');
  assert(vm.planSpecVersion === '2.1.0', 'VM planSpecVersion mismatch');
  assert(vm.stateLabel === 'EXECUTING', 'VM state label mismatch');
  assert(vm.strategyLabel === 'MANUAL', 'VM strategy label mismatch');
  assert(vm.displayName === 'Execution Plan: adapter-plan-env [Strategy: MANUAL] (plan-1)', 'VM displayName mismatch');
  assert(vm.createdTimestamp === plan.createdAt, 'VM created timestamp mismatch');

  // Verify immutability of ViewModel
  try {
    (vm as any).name = 'NewVMName';
    assert(false, 'ViewModel must be read-only and frozen');
  } catch (e) {
    // OK: ViewModel is frozen
  }

  console.log('[Test 4] RuntimeExecutionPlanAdapter ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  // Create and register runtime plan environment
  const plan = RuntimeExecutionPlanFactory.create(
    'rule-plan-env',
    'task-1',
    ExecutionStrategy.SEQUENTIAL,
    RuntimeExecutionPlanState.EXECUTING,
    'rules plan description',
    '1.0.0'
  );
  RuntimeExecutionPlanRegistry.register(plan);

  // Setup rule mapping to Capability "Testing" -> "pipeline-1" (via setupAllEnvironments)
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);

  const resolvedPlan = DevelopmentRules.getRuntimeExecutionPlan(rule);
  assert(resolvedPlan !== undefined, 'getRuntimeExecutionPlan should resolve the associated plan');
  assert(resolvedPlan?.planId === 'plan-1', 'Resolved plan ID mismatch');
  assert(resolvedPlan?.planName === 'rule-plan-env', 'Resolved plan name mismatch');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getRuntimeExecutionPlan(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

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
    console.log('\nAll Development Runtime Execution Plan tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
