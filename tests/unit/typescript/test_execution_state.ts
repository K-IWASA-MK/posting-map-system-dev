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
import { StateType, StateClassification, EXECUTION_STATE_BLUEPRINT } from '../../../src/execution/ExecutionState';
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

// ==============================================================================
// 1. StateType and StateClassification Enum verification
// ==============================================================================
function testStateEnums() {
  console.log('[Test 1] StateType and StateClassification Enum values verification starting...');
  assert(StateType.FOUNDATION === 'FOUNDATION', 'StateType FOUNDATION mismatch');
  assert(StateType.RUNTIME === 'RUNTIME', 'StateType RUNTIME mismatch');
  assert(StateType.SIMULATION === 'SIMULATION', 'StateType SIMULATION mismatch');
  assert(StateType.PLUGIN === 'PLUGIN', 'StateType PLUGIN mismatch');
  assert(StateType.AI === 'AI', 'StateType AI mismatch');

  assert(StateClassification.UNKNOWN === 'UNKNOWN', 'StateClassification UNKNOWN mismatch');
  assert(StateClassification.PENDING === 'PENDING', 'StateClassification PENDING mismatch');
  assert(StateClassification.READY === 'READY', 'StateClassification READY mismatch');
  assert(StateClassification.RUNNING === 'RUNNING', 'StateClassification RUNNING mismatch');
  assert(StateClassification.COMPLETED === 'COMPLETED', 'StateClassification COMPLETED mismatch');
  assert(StateClassification.FAILED === 'FAILED', 'StateClassification FAILED mismatch');
  assert(StateClassification.CANCELLED === 'CANCELLED', 'StateClassification CANCELLED mismatch');
  console.log('[Test 1] StateType and StateClassification Enum values verification: PASSED');
}

// ==============================================================================
// 2. Blueprint structure and multi-layer Object.isFrozen immutability verification
// ==============================================================================
function testStateStructureAndImmutability() {
  console.log('[Test 2] ExecutionStateBlueprint structure and immutability verification starting...');
  
  // Immutability checks on blueprint container itself
  assert(Object.isFrozen(EXECUTION_STATE_BLUEPRINT), 'EXECUTION_STATE_BLUEPRINT itself must be frozen');
  
  const state = EXECUTION_STATE_BLUEPRINT.getState();
  
  // State Model Freeze
  assert(Object.isFrozen(state), 'getState() result must be frozen');
  
  // Context Freeze
  assert(Object.isFrozen(state.context), 'State context must be frozen');
  
  // Metadata Freeze
  assert(Object.isFrozen(state.metadata), 'State metadata must be frozen');

  // Verify properties
  assert(state.id === 'execution-state-01', 'State ID mismatch');
  assert(state.name === 'Default Execution State', 'State Name mismatch');
  assert(state.stateType === StateType.FOUNDATION, 'State Type mismatch');
  assert(state.classification === StateClassification.PENDING, 'State Classification mismatch');
  
  // Context ID references check
  const context = state.context;
  assert(context.executionRequestId === 'execution-request-01', 'Context executionRequestId mismatch');
  assert(context.executionResultId === 'execution-result-01', 'Context executionResultId mismatch');
  assert(context.executionEngineId === 'engine-execution-01', 'Context executionEngineId mismatch');
  assert(context.executionRegistryId === 'registry-execution-01', 'Context executionRegistryId mismatch');
  
  const metadata = EXECUTION_STATE_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.phase === 'Phase 203-5', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionStateBlueprint structure and immutability verification: PASSED');
}

// ==============================================================================
// 3. Blueprint Getter APIs & declarative only validation
// ==============================================================================
function testStateGettersAndDeclarativeOnly() {
  console.log('[Test 3] State Getter APIs and declarative logic checks starting...');
  
  const context = EXECUTION_STATE_BLUEPRINT.getContext();
  const metadata = EXECUTION_STATE_BLUEPRINT.getMetadata();
  const state = EXECUTION_STATE_BLUEPRINT.getState();

  assert(context !== undefined, 'getContext failed');
  assert(metadata !== undefined, 'getMetadata failed');
  assert(state !== undefined, 'getState failed');

  // Assert absence of dynamic manipulation and state transition methods on state model
  assert((state as any).transition === undefined, 'No transition method should exist on ExecutionState model');
  assert((state as any).moveTo === undefined, 'No moveTo method should exist on ExecutionState model');
  assert((state as any).start === undefined, 'No start method should exist on ExecutionState model');
  assert((state as any).stop === undefined, 'No stop method should exist on ExecutionState model');
  assert((state as any).resume === undefined, 'No resume method should exist on ExecutionState model');
  assert((state as any).cancel === undefined, 'No cancel method should exist on ExecutionState model');
  assert((state as any).update === undefined, 'No update method should exist on ExecutionState model');
  assert((state as any).synchronize === undefined, 'No synchronize method should exist on ExecutionState model');

  // Assert absence of dynamic manipulation and state transition methods on blueprint container
  assert((EXECUTION_STATE_BLUEPRINT as any).transition === undefined, 'No transition method should exist on blueprint container');
  assert((EXECUTION_STATE_BLUEPRINT as any).moveTo === undefined, 'No moveTo method should exist on blueprint container');
  assert((EXECUTION_STATE_BLUEPRINT as any).start === undefined, 'No start method should exist on blueprint container');
  assert((EXECUTION_STATE_BLUEPRINT as any).stop === undefined, 'No stop method should exist on blueprint container');
  assert((EXECUTION_STATE_BLUEPRINT as any).resume === undefined, 'No resume method should exist on blueprint container');
  assert((EXECUTION_STATE_BLUEPRINT as any).cancel === undefined, 'No cancel method should exist on blueprint container');
  assert((EXECUTION_STATE_BLUEPRINT as any).update === undefined, 'No update method should exist on blueprint container');
  assert((EXECUTION_STATE_BLUEPRINT as any).synchronize === undefined, 'No synchronize method should exist on blueprint container');

  console.log('[Test 3] State Getter APIs and declarative logic checks: PASSED');
}

// ==============================================================================
// 4. Deterministic Reference verification
// ==============================================================================
function testReferenceDeterminism() {
  console.log('[Test 4] State referential determinism checks starting...');
  
  const s1 = EXECUTION_STATE_BLUEPRINT.getState();
  const s2 = EXECUTION_STATE_BLUEPRINT.getState();
  assert(s1 === s2, 'getState() must return the exact same frozen reference');

  const c1 = EXECUTION_STATE_BLUEPRINT.getContext();
  const c2 = EXECUTION_STATE_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext() must return the exact same frozen reference');

  const m1 = EXECUTION_STATE_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_STATE_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] State referential determinism checks: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const state = DevelopmentRules.getExecutionState(rule);
  assert(state !== undefined, 'getExecutionState should resolve statically');
  assert(state?.id === 'execution-state-01', 'Resolved state ID mismatch');
  assert(state?.stateType === StateType.FOUNDATION, 'Resolved state type mismatch');
  assert(state?.classification === StateClassification.PENDING, 'Resolved state classification mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const state2 = DevelopmentRules.getExecutionState(rule);
  assert(state === state2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionState(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testStateEnums();
    testStateStructureAndImmutability();
    testStateGettersAndDeclarativeOnly();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution State Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
