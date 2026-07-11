import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../../../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../src/aios/SkillRegistry';
import { SkillFactory } from '../../../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../../../src/aios/SkillPipelineFactory';
import { RuntimeRegistry, RuntimeState, RuntimeMode } from '../../../src/aios/RuntimeRegistry';
import { RuntimeFactory } from '../../../src/aios/RuntimeFactory';
import { RuntimeSessionRegistry, RuntimeSessionState } from '../../../src/aios/RuntimeSessionRegistry';
import { RuntimeSessionFactory } from '../../../src/aios/RuntimeSessionFactory';
import { RuntimeContextRegistry, RuntimeContextState } from '../../../src/aios/RuntimeContextRegistry';
import { RuntimeContextFactory } from '../../../src/aios/RuntimeContextFactory';
import { RuntimeQueueRegistry, RuntimeQueueState, QueuePriority } from '../../../src/aios/RuntimeQueueRegistry';
import { RuntimeQueueFactory } from '../../../src/aios/RuntimeQueueFactory';
import { RuntimeTaskRegistry, RuntimeTaskState, RuntimeTaskType } from '../../../src/aios/RuntimeTaskRegistry';
import { RuntimeTaskFactory } from '../../../src/aios/RuntimeTaskFactory';
import { RuntimeExecutionPlanRegistry, RuntimeExecutionPlanState, ExecutionStrategy } from '../../../src/aios/RuntimeExecutionPlanRegistry';
import { RuntimeExecutionPlanFactory } from '../../../src/aios/RuntimeExecutionPlanFactory';
import { RuntimeExecutionGraphRegistry, RuntimeExecutionGraphState } from '../../../src/aios/RuntimeExecutionGraphRegistry';
import { RuntimeExecutionGraphFactory } from '../../../src/aios/RuntimeExecutionGraphFactory';
import { EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT, StateManagerType, StateManagerScope, RuntimeStateType, RUNTIME_STATE_MODELS } from '../../../src/execution/ExecutionRuntimeStateManager';
import { DevelopmentRules } from '../../../src/aios/DevelopmentRules';

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

  // Register Graph (ID: graph-1)
  const graph = RuntimeExecutionGraphFactory.create('TestGraph', ['plan-1'], RuntimeExecutionGraphState.CREATED);
  RuntimeExecutionGraphRegistry.register(graph);
}

// 1. Structure and Immutability check
function testStateManagerStructureAndImmutability() {
  console.log('[Test 1] State Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT), 'EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getExecutionRuntimeStateManager();
  assert(Object.isFrozen(manager), 'State Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-state-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'State Manager Layer', 'Metadata layer mismatch');

  assert(StateManagerType.FOUNDATION === 'FOUNDATION', 'Enum StateManagerType check failed');
  assert(StateManagerScope.SYSTEM === 'SYSTEM', 'Enum StateManagerScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. State Manager Context and Blueprint values checks
function testStateManagerBlueprintValues() {
  console.log('[Test 2] State Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getExecutionRuntimeStateManager();
  const context = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getData();

  assert(manager.id === 'runtime-state-manager-01', 'State Manager ID mismatch');
  assert(manager.context === context, 'State Manager context mismatch');
  assert(manager.data === data, 'State Manager data mismatch');

  // Verify context holds only runtimeStateManagerId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'State Manager Context must hold exactly 1 property');
  assert(context.runtimeStateManagerId === 'runtime-state-manager-01', 'Context runtimeStateManagerId mismatch');

  // Verify stateModels are specified correctly
  assert(data.stateModels.length === 4, 'State models count must be exactly 4');
  assert(data.stateModels[0].stateType === RuntimeStateType.BOOT_STATE, 'State model 1 mismatch');
  assert(data.stateModels[1].stateType === RuntimeStateType.PIPELINE_STATE, 'State model 2 mismatch');
  assert(data.stateModels[2].stateType === RuntimeStateType.CONTEXT_STATE, 'State model 3 mismatch');
  assert(data.stateModels[3].stateType === RuntimeStateType.RUNTIME_STATE, 'State model 4 mismatch');

  // Verify each state model has version 1.0
  assert(data.stateModels[0].metadata.stateModelVersion === '1.0', 'State model 1 version mismatch');
  assert(data.stateModels[1].metadata.stateModelVersion === '1.0', 'State model 2 version mismatch');
  assert(data.stateModels[2].metadata.stateModelVersion === '1.0', 'State model 3 version mismatch');
  assert(data.stateModels[3].metadata.stateModelVersion === '1.0', 'State model 4 version mismatch');

  // Verify static state models list matches
  const list = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getStateModels();
  assert(list === RUNTIME_STATE_MODELS, 'State models list object mismatch');
  assert(Object.isFrozen(list), 'State models list must be frozen');

  console.log('[Test 2] State Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] State Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeStateManager(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeStateManager(rule);
  
  assert(manager1 !== undefined, 'State Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive state manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeStateManager() {
  console.log('[Test 4] Verifying total absence of active state manager/execution/launcher/plugin APIs...');

  const forbiddenMethods = [
    'updateState', 'transitionState', 'restoreState', 'syncState', 'notifyState',
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_STATE_MANAGER_BLUEPRINT.getExecutionRuntimeStateManager();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeStateManager object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active state manager/execution/launcher/plugin APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeStateManager(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeStateManager should return a valid result');
  assert(manager?.id === 'runtime-state-manager-01', 'Resolved state manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeStateManager(ruleWithoutPipeline) === undefined, 'Rules state manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testStateManagerStructureAndImmutability();
    testStateManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeStateManager();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime State Manager Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
