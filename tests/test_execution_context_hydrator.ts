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
import { HydratorType, HydrationStrategy, EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT } from '../src/execution/ExecutionContextHydrator';
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

  // Register Graph (ID: graph-1)
  const graph = RuntimeExecutionGraphFactory.create('TestGraph', ['plan-1'], RuntimeExecutionGraphState.CREATED);
  RuntimeExecutionGraphRegistry.register(graph);
}

// 1. Enum verification
function testEnums() {
  console.log('[Test 1] HydratorType and HydrationStrategy Enums verification starting...');
  assert(HydratorType.FOUNDATION === 'FOUNDATION', 'FOUNDATION enum mismatch');
  assert(HydratorType.RUNTIME === 'RUNTIME', 'RUNTIME enum mismatch');
  assert(HydratorType.SIMULATION === 'SIMULATION', 'SIMULATION enum mismatch');
  assert(HydratorType.PLUGIN === 'PLUGIN', 'PLUGIN enum mismatch');
  assert(HydratorType.AI === 'AI', 'AI enum mismatch');

  assert(HydrationStrategy.STATIC === 'STATIC', 'STATIC strategy mismatch');
  assert(HydrationStrategy.REGISTRY === 'REGISTRY', 'REGISTRY strategy mismatch');
  assert(HydrationStrategy.REFERENCE === 'REFERENCE', 'REFERENCE strategy mismatch');
  assert(HydrationStrategy.MAPPING === 'MAPPING', 'MAPPING strategy mismatch');
  console.log('[Test 1] Enums verification: PASSED');
}

// 2. Blueprint structure and Object.isFrozen verification
function testBlueprintStructureAndFreeze() {
  console.log('[Test 2] ExecutionContextHydratorBlueprint structure and immutability verification starting...');
  
  assert(Object.isFrozen(EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT), 'EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT must be frozen');
  
  const hydrator = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getHydrator();
  assert(Object.isFrozen(hydrator), 'getHydrator() must be frozen');
  assert(Object.isFrozen(hydrator.context), 'Context must be frozen');
  assert(Object.isFrozen(hydrator.metadata), 'Metadata must be frozen');

  // Verify properties
  assert(hydrator.id === 'context-hydrator-01', 'Hydrator ID mismatch');
  assert(hydrator.name === 'Default Execution Context Hydrator', 'Hydrator Name mismatch');
  assert(hydrator.hydratorType === HydratorType.FOUNDATION, 'Hydrator Type mismatch');
  assert(hydrator.strategy === HydrationStrategy.STATIC, 'Hydration Strategy mismatch');
  
  // Verify context IDs
  const context = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getContext();
  assert(context.runtimeId === 'execution-runtime-01', 'runtimeId ID mismatch');
  assert(context.runtimeRegistryId === 'registry-runtime-01', 'runtimeRegistryId ID mismatch');
  assert(context.executionRequestId === 'execution-request-01', 'executionRequestId ID mismatch');
  assert(context.executionResultId === 'execution-result-01', 'executionResultId ID mismatch');
  assert(context.executionStateId === 'execution-state-01', 'executionStateId ID mismatch');
  assert(context.executionResolverId === 'execution-resolver-01', 'executionResolverId ID mismatch');
  assert(context.executionDispatcherId === 'execution-dispatcher-01', 'executionDispatcherId ID mismatch');

  // Verify metadata properties
  const metadata = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 204-3', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionContextHydratorBlueprint structure and immutability verification: PASSED');
}

// 3. Getter API and Pure Declarative check (No hydrate / bind / instantiate / etc.)
function testBlueprintGettersAndAbsenceOfRuntimeLogic() {
  console.log('[Test 3] Blueprint Getter APIs and runtime logic absence check starting...');

  const hydrator = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getHydrator();
  
  // Verify that active methods DO NOT exist on the model or the container
  const forbiddenMethods = [
    'hydrate', 'bind', 'resolve', 'lookup', 'search', 
    'create', 'instantiate', 'execute'
  ];

  for (const method of forbiddenMethods) {
    assert((hydrator as any)[method] === undefined, `Method ${method} should not exist on ExecutionContextHydrator model`);
    assert((EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT as any)[method] === undefined, `Method ${method} should not exist on EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT container`);
  }

  console.log('[Test 3] Blueprint Getter APIs and runtime logic absence check: PASSED');
}

// 4. Deterministic Reference verification
function testReferenceDeterminism() {
  console.log('[Test 4] Blueprint referential determinism checks starting...');
  
  const h1 = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getHydrator();
  const h2 = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getHydrator();
  assert(h1 === h2, 'getHydrator() must return the exact same frozen reference');

  const c1 = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getContext();
  const c2 = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext() must return the exact same frozen reference');

  const m1 = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_CONTEXT_HYDRATOR_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Blueprint referential determinism checks: PASSED');
}

// 5. DevelopmentRules Static Mapping Integration Verification
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const hydrator = DevelopmentRules.getExecutionContextHydrator(rule);
  assert(hydrator !== undefined, 'getExecutionContextHydrator should resolve the hydrator descriptor statically');
  assert(hydrator?.id === 'context-hydrator-01', 'Resolved hydrator ID mismatch');
  assert(hydrator?.hydratorType === HydratorType.FOUNDATION, 'Resolved hydrator type mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const hydrator2 = DevelopmentRules.getExecutionContextHydrator(rule);
  assert(hydrator === hydrator2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionContextHydrator(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testEnums();
    testBlueprintStructureAndFreeze();
    testBlueprintGettersAndAbsenceOfRuntimeLogic();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Context Hydrator Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
