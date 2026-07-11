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
import { DispatcherType, DispatcherStrategy, EXECUTION_DISPATCHER_BLUEPRINT } from '../../../src/execution/ExecutionDispatcher';
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
// 1. DispatcherType and DispatcherStrategy Enum verification
// ==============================================================================
function testDispatcherEnums() {
  console.log('[Test 1] DispatcherType and DispatcherStrategy Enum values verification starting...');
  assert(DispatcherType.FOUNDATION === 'FOUNDATION', 'DispatcherType FOUNDATION mismatch');
  assert(DispatcherType.RUNTIME === 'RUNTIME', 'DispatcherType RUNTIME mismatch');
  assert(DispatcherType.SIMULATION === 'SIMULATION', 'DispatcherType SIMULATION mismatch');
  assert(DispatcherType.PLUGIN === 'PLUGIN', 'DispatcherType PLUGIN mismatch');
  assert(DispatcherType.AI === 'AI', 'DispatcherType AI mismatch');

  assert(DispatcherStrategy.STATIC === 'STATIC', 'DispatcherStrategy STATIC mismatch');
  assert(DispatcherStrategy.DIRECT === 'DIRECT', 'DispatcherStrategy DIRECT mismatch');
  assert(DispatcherStrategy.PIPELINE === 'PIPELINE', 'DispatcherStrategy PIPELINE mismatch');
  assert(DispatcherStrategy.ROUTER === 'ROUTER', 'DispatcherStrategy ROUTER mismatch');
  console.log('[Test 1] DispatcherType and DispatcherStrategy Enum values verification: PASSED');
}

// ==============================================================================
// 2. Blueprint structure and multi-layer Object.isFrozen immutability verification
// ==============================================================================
function testDispatcherStructureAndImmutability() {
  console.log('[Test 2] ExecutionDispatcherBlueprint structure and immutability verification starting...');
  
  // Immutability checks on blueprint container itself
  assert(Object.isFrozen(EXECUTION_DISPATCHER_BLUEPRINT), 'EXECUTION_DISPATCHER_BLUEPRINT itself must be frozen');
  
  const dispatcher = EXECUTION_DISPATCHER_BLUEPRINT.getDispatcher();
  
  // Dispatcher Model Freeze
  assert(Object.isFrozen(dispatcher), 'getDispatcher() result must be frozen');
  
  // Context Freeze
  assert(Object.isFrozen(dispatcher.context), 'Dispatcher context must be frozen');
  
  // Metadata Freeze
  assert(Object.isFrozen(dispatcher.metadata), 'Dispatcher metadata must be frozen');

  // Verify properties
  assert(dispatcher.id === 'execution-dispatcher-01', 'Dispatcher ID mismatch');
  assert(dispatcher.name === 'Default Execution Dispatcher', 'Dispatcher Name mismatch');
  assert(dispatcher.dispatcherType === DispatcherType.FOUNDATION, 'Dispatcher Type mismatch');
  assert(dispatcher.strategy === DispatcherStrategy.STATIC, 'Dispatcher Strategy mismatch');
  
  // Context ID references check
  const context = dispatcher.context;
  assert(context.executionEngineId === 'engine-execution-01', 'Context executionEngineId mismatch');
  assert(context.executionRegistryId === 'registry-execution-01', 'Context executionRegistryId mismatch');
  assert(context.executionRequestId === 'execution-request-01', 'Context executionRequestId mismatch');
  assert(context.executionResultId === 'execution-result-01', 'Context executionResultId mismatch');
  assert(context.executionStateId === 'execution-state-01', 'Context executionStateId mismatch');
  assert(context.executionResolverId === 'execution-resolver-01', 'Context executionResolverId mismatch');
  
  const metadata = EXECUTION_DISPATCHER_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.phase === 'Phase 203-7', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionDispatcherBlueprint structure and immutability verification: PASSED');
}

// ==============================================================================
// 3. Blueprint Getter APIs & declarative only validation
// ==============================================================================
function testDispatcherGettersAndDeclarativeOnly() {
  console.log('[Test 3] Dispatcher Getter APIs and declarative logic checks starting...');
  
  const context = EXECUTION_DISPATCHER_BLUEPRINT.getContext();
  const metadata = EXECUTION_DISPATCHER_BLUEPRINT.getMetadata();
  const dispatcher = EXECUTION_DISPATCHER_BLUEPRINT.getDispatcher();

  assert(context !== undefined, 'getContext failed');
  assert(metadata !== undefined, 'getMetadata failed');
  assert(dispatcher !== undefined, 'getDispatcher failed');

  // Assert absence of dynamic routing, dispatching, and execution methods on dispatcher model
  assert((dispatcher as any).dispatch === undefined, 'No dispatch method should exist on ExecutionDispatcher model');
  assert((dispatcher as any).route === undefined, 'No route method should exist on ExecutionDispatcher model');
  assert((dispatcher as any).schedule === undefined, 'No schedule method should exist on ExecutionDispatcher model');
  assert((dispatcher as any).invoke === undefined, 'No invoke method should exist on ExecutionDispatcher model');
  assert((dispatcher as any).execute === undefined, 'No execute method should exist on ExecutionDispatcher model');
  assert((dispatcher as any).enqueue === undefined, 'No enqueue method should exist on ExecutionDispatcher model');
  assert((dispatcher as any).retry === undefined, 'No retry method should exist on ExecutionDispatcher model');

  // Assert absence of dynamic routing, dispatching, and execution methods on blueprint container
  assert((EXECUTION_DISPATCHER_BLUEPRINT as any).dispatch === undefined, 'No dispatch method should exist on blueprint container');
  assert((EXECUTION_DISPATCHER_BLUEPRINT as any).route === undefined, 'No route method should exist on blueprint container');
  assert((EXECUTION_DISPATCHER_BLUEPRINT as any).schedule === undefined, 'No schedule method should exist on blueprint container');
  assert((EXECUTION_DISPATCHER_BLUEPRINT as any).invoke === undefined, 'No invoke method should exist on blueprint container');
  assert((EXECUTION_DISPATCHER_BLUEPRINT as any).execute === undefined, 'No execute method should exist on blueprint container');
  assert((EXECUTION_DISPATCHER_BLUEPRINT as any).enqueue === undefined, 'No enqueue method should exist on blueprint container');
  assert((EXECUTION_DISPATCHER_BLUEPRINT as any).retry === undefined, 'No retry method should exist on blueprint container');

  console.log('[Test 3] Dispatcher Getter APIs and declarative logic checks: PASSED');
}

// ==============================================================================
// 4. Deterministic Reference verification
// ==============================================================================
function testReferenceDeterminism() {
  console.log('[Test 4] Dispatcher referential determinism checks starting...');
  
  const d1 = EXECUTION_DISPATCHER_BLUEPRINT.getDispatcher();
  const d2 = EXECUTION_DISPATCHER_BLUEPRINT.getDispatcher();
  assert(d1 === d2, 'getDispatcher() must return the exact same frozen reference');

  const c1 = EXECUTION_DISPATCHER_BLUEPRINT.getContext();
  const c2 = EXECUTION_DISPATCHER_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext() must return the exact same frozen reference');

  const m1 = EXECUTION_DISPATCHER_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_DISPATCHER_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Dispatcher referential determinism checks: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const dispatcher = DevelopmentRules.getExecutionDispatcher(rule);
  assert(dispatcher !== undefined, 'getExecutionDispatcher should resolve statically');
  assert(dispatcher?.id === 'execution-dispatcher-01', 'Resolved dispatcher ID mismatch');
  assert(dispatcher?.dispatcherType === DispatcherType.FOUNDATION, 'Resolved dispatcher type mismatch');
  assert(dispatcher?.strategy === DispatcherStrategy.STATIC, 'Resolved dispatcher strategy mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const dispatcher2 = DevelopmentRules.getExecutionDispatcher(rule);
  assert(dispatcher === dispatcher2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionDispatcher(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testDispatcherEnums();
    testDispatcherStructureAndImmutability();
    testDispatcherGettersAndDeclarativeOnly();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Dispatcher Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
