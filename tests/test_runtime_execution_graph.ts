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
import { RuntimeExecutionPlanRegistry, RuntimeExecutionPlanState, ExecutionStrategy } from '../src/aios/RuntimeExecutionPlanRegistry';
import { RuntimeExecutionPlanFactory } from '../src/aios/RuntimeExecutionPlanFactory';
import { RuntimeExecutionGraphRegistry, RuntimeExecutionGraphState } from '../src/aios/RuntimeExecutionGraphRegistry';
import { RuntimeExecutionGraphFactory } from '../src/aios/RuntimeExecutionGraphFactory';
import { RuntimeExecutionGraphValidator } from '../src/aios/RuntimeExecutionGraphValidator';
import { RuntimeExecutionGraphAdapter } from '../src/aios/RuntimeExecutionGraphAdapter';
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
  RuntimeExecutionPlanRegistry.clear();
  RuntimeExecutionPlanFactory.resetCounter();
  RuntimeExecutionGraphRegistry.clear();
  RuntimeExecutionGraphFactory.resetCounter();

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

  // Register Plan (ID: plan-1)
  const plan = RuntimeExecutionPlanFactory.create('TestPlan', 'task-1', ExecutionStrategy.SEQUENTIAL, RuntimeExecutionPlanState.CREATED);
  RuntimeExecutionPlanRegistry.register(plan);

  // Register another Plan (ID: plan-2)
  const plan2 = RuntimeExecutionPlanFactory.create('TestPlan2', 'task-1', ExecutionStrategy.SEQUENTIAL, RuntimeExecutionPlanState.CREATED);
  RuntimeExecutionPlanRegistry.register(plan2);
}

// ==============================================================================
// 1. RuntimeExecutionGraphRegistry Metadata and Operations
// ==============================================================================
function testRegistryBasic() {
  console.log('[Test 1] RuntimeExecutionGraphRegistry Metadata and Basic Operations starting...');
  setupAllEnvironments();

  // Metadata verification
  assert(RuntimeExecutionGraphRegistry.metadata.registryId === 'reg-runtime-execution-graph-01', 'Metadata registry ID mismatch');
  assert(RuntimeExecutionGraphRegistry.metadata.registryVersion === '1.0.0', 'Metadata registry version mismatch');

  const graph = RuntimeExecutionGraphFactory.create(
    'test-graph-1',
    ['plan-1'],
    RuntimeExecutionGraphState.CREATED,
    'A logical test graph',
    '1.0.0'
  );

  assert(graph.graphId === 'graph-1', 'Factory failed to assign graph-1 ID');
  assert(graph.graphName === 'test-graph-1', 'graphName assignment mismatch');
  assert(graph.planIds.length === 1 && graph.planIds[0] === 'plan-1', 'planIds assignment mismatch');
  assert(graph.graphState === RuntimeExecutionGraphState.CREATED, 'graphState assignment mismatch');

  RuntimeExecutionGraphRegistry.register(graph);
  
  const fetched = RuntimeExecutionGraphRegistry.get('graph-1');
  assert(fetched !== undefined, 'Failed to fetch registered graph');
  assert(fetched?.graphName === 'test-graph-1', 'Fetched graph name mismatch');

  // Verifyexists, findByName, count
  assert(RuntimeExecutionGraphRegistry.exists('graph-1') === true, 'exists failed');
  assert(RuntimeExecutionGraphRegistry.exists('graph-unregistered') === false, 'exists true for unregistered ID');
  assert(RuntimeExecutionGraphRegistry.findByName('test-graph-1') !== undefined, 'findByName failed');
  assert(RuntimeExecutionGraphRegistry.count() === 1, 'count mismatch');

  // Verify findByPlan
  const listByPlan = RuntimeExecutionGraphRegistry.findByPlan('plan-1');
  assert(listByPlan.length === 1, 'Should find 1 graph associated with plan-1');
  assert(listByPlan[0].graphId === 'graph-1', 'Associated graph ID mismatch');

  // Verify findByState
  const listByState = RuntimeExecutionGraphRegistry.findByState(RuntimeExecutionGraphState.CREATED);
  assert(listByState.length === 1, 'Should find 1 graph associated with state CREATED');

  // Verify clear and findAll
  assert(RuntimeExecutionGraphRegistry.findAll().length === 1, 'findAll should return 1 record');
  RuntimeExecutionGraphRegistry.clear();
  assert(RuntimeExecutionGraphRegistry.findAll().length === 0, 'clear should empty the registry');

  console.log('[Test 1] RuntimeExecutionGraphRegistry Metadata and Basic Operations: PASSED');
}

// ==============================================================================
// 2. Factory and Determinism
// ==============================================================================
function testFactoryDeterminism() {
  console.log('[Test 2] Factory and ID Determinism verification starting...');
  setupAllEnvironments();

  const g1 = RuntimeExecutionGraphFactory.create('G1', ['plan-1'], RuntimeExecutionGraphState.CREATED);
  const g2 = RuntimeExecutionGraphFactory.create('G2', ['plan-1'], RuntimeExecutionGraphState.READY);
  
  assert(g1.graphId === 'graph-1', 'First ID must be graph-1');
  assert(g2.graphId === 'graph-2', 'Second ID must be graph-2');

  // Counter reset verification
  RuntimeExecutionGraphFactory.resetCounter();
  const g3 = RuntimeExecutionGraphFactory.create('G3', ['plan-1'], RuntimeExecutionGraphState.CREATED);
  assert(g3.graphId === 'graph-1', 'Counter reset failed');

  // Immutability verification
  try {
    (g1 as any).graphName = 'ModifiedName';
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
  console.log('[Test 3] RuntimeExecutionGraphValidator validation verification starting...');
  setupAllEnvironments();

  const validGraph = RuntimeExecutionGraphFactory.create('ValidGraph', ['plan-1', 'plan-2'], RuntimeExecutionGraphState.CREATED);

  // Valid record validation should not throw
  RuntimeExecutionGraphValidator.validate(validGraph);

  // 3.1 ID format validation
  try {
    const badId = { ...validGraph, graphId: 'bad-id' };
    RuntimeExecutionGraphValidator.validate(badId);
    assert(false, 'Should fail validation for invalid graphId');
  } catch (e: any) {
    assert(e.message.includes('Invalid graphId format'), 'Error message mismatch');
  }

  // 3.2 INVALID_GRAPH_STATE validation
  try {
    const badState = { ...validGraph, graphState: 'INVALID_STATE' as any };
    RuntimeExecutionGraphValidator.validate(badState);
    assert(false, 'Should fail validation for INVALID_GRAPH_STATE');
  } catch (e: any) {
    assert(e.message.includes('Invalid graphState'), 'INVALID_GRAPH_STATE check failed');
  }

  // 3.3 INVALID_GRAPH_VERSION validation
  try {
    const badVersion = { ...validGraph, version: '   ' };
    RuntimeExecutionGraphValidator.validate(badVersion);
    assert(false, 'Should fail validation for INVALID_GRAPH_VERSION');
  } catch (e: any) {
    assert(e.message.includes('version is required'), 'INVALID_GRAPH_VERSION check failed');
  }

  // 3.4 INVALID_GRAPH_DATE validation
  try {
    const badDateSequence = { ...validGraph, createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T09:00:00Z' };
    RuntimeExecutionGraphValidator.validate(badDateSequence);
    assert(false, 'Should fail validation for INVALID_GRAPH_DATE (createdAt > updatedAt)');
  } catch (e: any) {
    assert(e.message.includes('Invalid graph date sequence'), 'INVALID_GRAPH_DATE check failed');
  }

  // 3.5 EMPTY_EXECUTION_GRAPH validation (INVALID_PLAN_COUNT)
  try {
    const emptyPlanList = { ...validGraph, planIds: [] };
    RuntimeExecutionGraphValidator.validate(emptyPlanList);
    assert(false, 'Should fail validation for empty plan list');
  } catch (e: any) {
    assert(e.message.includes('planIds cannot be empty'), 'EMPTY_EXECUTION_GRAPH check failed');
  }

  // 3.6 DUPLICATE_PLAN_REFERENCE validation
  try {
    const duplicatePlanList = { ...validGraph, planIds: ['plan-1', 'plan-1'] };
    RuntimeExecutionGraphValidator.validate(duplicatePlanList);
    assert(false, 'Should fail validation for DUPLICATE_PLAN_REFERENCE');
  } catch (e: any) {
    assert(e.message.includes('Duplicate plan reference found'), 'DUPLICATE_PLAN_REFERENCE check failed');
  }

  // 3.7 INVALID_PLAN_ORDER validation
  try {
    const badOrderPlanList = { ...validGraph, planIds: ['plan-2', 'plan-1'] };
    RuntimeExecutionGraphValidator.validate(badOrderPlanList);
    assert(false, 'Should fail validation for INVALID_PLAN_ORDER');
  } catch (e: any) {
    assert(e.message.includes('Invalid plan order'), 'INVALID_PLAN_ORDER check failed');
  }

  // 3.8 INVALID_PLAN_REFERENCE validation
  try {
    const badPlanRef = { ...validGraph, planIds: ['plan-unregistered'] };
    RuntimeExecutionGraphValidator.validate(badPlanRef);
    assert(false, 'Should fail validation for INVALID_PLAN_REFERENCE');
  } catch (e: any) {
    assert(e.message.includes('Execution Plan dependency not registered'), 'INVALID_PLAN_REFERENCE check failed');
  }

  // 3.9 DUPLICATE_GRAPH ID validation
  try {
    RuntimeExecutionGraphRegistry.register(validGraph);
    // Duplicate registration should throw DUPLICATE_GRAPH
    RuntimeExecutionGraphRegistry.register(validGraph);
    assert(false, 'Should throw error for DUPLICATE_GRAPH ID');
  } catch (e: any) {
    assert(e.message.includes('ExecutionGraph ID already registered'), 'DUPLICATE_GRAPH check failed');
  }

  // 3.10 DUPLICATE_GRAPH Name validation
  try {
    RuntimeExecutionGraphRegistry.clear();
    RuntimeExecutionGraphRegistry.register(validGraph);
    // Duplicate graph name with different ID should throw DUPLICATE_GRAPH
    const sameNameGraph = { ...validGraph, graphId: 'graph-2' };
    RuntimeExecutionGraphRegistry.register(sameNameGraph);
    assert(false, 'Should throw error for duplicate graphName');
  } catch (e: any) {
    assert(e.message.includes('ExecutionGraph Name already registered'), 'DUPLICATE_GRAPH check by name failed');
  }

  console.log('[Test 3] RuntimeExecutionGraphValidator validation verification: PASSED');
}

// ==============================================================================
// 4. RuntimeExecutionGraphAdapter and ViewModel conversion
// ==============================================================================
function testAdapterViewModel() {
  console.log('[Test 4] RuntimeExecutionGraphAdapter ViewModel conversion verification starting......');
  setupAllEnvironments();

  const graph = RuntimeExecutionGraphFactory.create(
    'adapter-graph-env',
    ['plan-1', 'plan-2'],
    RuntimeExecutionGraphState.PLANNED,
    'Production graph context description',
    '2.1.0'
  );

  const vm = RuntimeExecutionGraphAdapter.toViewModel(graph);
  
  assert(vm.id === graph.graphId, 'VM ID mismatch');
  assert(vm.name === 'adapter-graph-env', 'VM name mismatch');
  assert(vm.planIds.length === 2 && vm.planIds[1] === 'plan-2', 'VM planIds mismatch');
  assert(vm.descriptionText === 'Production graph context description', 'VM description mismatch');
  assert(vm.stateLabel === 'PLANNED', 'VM state label mismatch');
  assert(vm.graphLabel === 'Graph: adapter-graph-env', 'VM graphLabel mismatch');
  assert(vm.displayName === 'Execution Graph: adapter-graph-env [Plans: 2] (graph-1)', 'VM displayName mismatch');
  assert(vm.planCount === 2, 'VM planCount mismatch');
  assert(vm.createdTimestamp === graph.createdAt, 'VM created timestamp mismatch');

  // Verify immutability of ViewModel
  try {
    (vm as any).name = 'NewVMName';
    assert(false, 'ViewModel must be read-only and frozen');
  } catch (e) {
    // OK: ViewModel is frozen
  }

  console.log('[Test 4] RuntimeExecutionGraphAdapter ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  // Create and register runtime graph environment
  const graph = RuntimeExecutionGraphFactory.create(
    'rule-graph-env',
    ['plan-1'],
    RuntimeExecutionGraphState.PLANNED,
    'rules graph description',
    '1.0.0'
  );
  RuntimeExecutionGraphRegistry.register(graph);

  // Setup rule mapping to Capability "Testing" -> "pipeline-1" (via setupAllEnvironments)
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);

  const resolvedGraph = DevelopmentRules.getRuntimeExecutionGraph(rule);
  assert(resolvedGraph !== undefined, 'getRuntimeExecutionGraph should resolve the associated graph');
  assert(resolvedGraph?.graphId === 'graph-1', 'Resolved graph ID mismatch');
  assert(resolvedGraph?.graphName === 'rule-graph-env', 'Resolved graph name mismatch');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getRuntimeExecutionGraph(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

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
    console.log('\nAll Development Runtime Execution Graph tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
