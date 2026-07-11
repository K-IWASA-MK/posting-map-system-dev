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
import { ResolverType, ResolverStrategy, EXECUTION_RESOLVER_BLUEPRINT } from '../../../src/execution/ExecutionResolver';
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
// 1. ResolverType and ResolverStrategy Enum verification
// ==============================================================================
function testResolverEnums() {
  console.log('[Test 1] ResolverType and ResolverStrategy Enum values verification starting...');
  assert(ResolverType.FOUNDATION === 'FOUNDATION', 'ResolverType FOUNDATION mismatch');
  assert(ResolverType.RUNTIME === 'RUNTIME', 'ResolverType RUNTIME mismatch');
  assert(ResolverType.SIMULATION === 'SIMULATION', 'ResolverType SIMULATION mismatch');
  assert(ResolverType.PLUGIN === 'PLUGIN', 'ResolverType PLUGIN mismatch');
  assert(ResolverType.AI === 'AI', 'ResolverType AI mismatch');

  assert(ResolverStrategy.STATIC === 'STATIC', 'ResolverStrategy STATIC mismatch');
  assert(ResolverStrategy.MAPPING === 'MAPPING', 'ResolverStrategy MAPPING mismatch');
  assert(ResolverStrategy.REGISTRY === 'REGISTRY', 'ResolverStrategy REGISTRY mismatch');
  assert(ResolverStrategy.PIPELINE === 'PIPELINE', 'ResolverStrategy PIPELINE mismatch');
  console.log('[Test 1] ResolverType and ResolverStrategy Enum values verification: PASSED');
}

// ==============================================================================
// 2. Blueprint structure and multi-layer Object.isFrozen immutability verification
// ==============================================================================
function testResolverStructureAndImmutability() {
  console.log('[Test 2] ExecutionResolverBlueprint structure and immutability verification starting...');
  
  // Immutability checks on blueprint container itself
  assert(Object.isFrozen(EXECUTION_RESOLVER_BLUEPRINT), 'EXECUTION_RESOLVER_BLUEPRINT itself must be frozen');
  
  const resolver = EXECUTION_RESOLVER_BLUEPRINT.getResolver();
  
  // Resolver Model Freeze
  assert(Object.isFrozen(resolver), 'getResolver() result must be frozen');
  
  // Context Freeze
  assert(Object.isFrozen(resolver.context), 'Resolver context must be frozen');
  
  // Metadata Freeze
  assert(Object.isFrozen(resolver.metadata), 'Resolver metadata must be frozen');

  // Verify properties
  assert(resolver.id === 'execution-resolver-01', 'Resolver ID mismatch');
  assert(resolver.name === 'Default Execution Resolver', 'Resolver Name mismatch');
  assert(resolver.resolverType === ResolverType.FOUNDATION, 'Resolver Type mismatch');
  assert(resolver.strategy === ResolverStrategy.STATIC, 'Resolver Strategy mismatch');
  
  // Context ID references check
  const context = resolver.context;
  assert(context.executionEngineId === 'engine-execution-01', 'Context executionEngineId mismatch');
  assert(context.executionRegistryId === 'registry-execution-01', 'Context executionRegistryId mismatch');
  assert(context.executionRequestId === 'execution-request-01', 'Context executionRequestId mismatch');
  assert(context.executionResultId === 'execution-result-01', 'Context executionResultId mismatch');
  assert(context.executionStateId === 'execution-state-01', 'Context executionStateId mismatch');
  
  const metadata = EXECUTION_RESOLVER_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.phase === 'Phase 203-6', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionResolverBlueprint structure and immutability verification: PASSED');
}

// ==============================================================================
// 3. Blueprint Getter APIs & declarative only validation
// ==============================================================================
function testResolverGettersAndDeclarativeOnly() {
  console.log('[Test 3] Resolver Getter APIs and declarative logic checks starting...');
  
  const context = EXECUTION_RESOLVER_BLUEPRINT.getContext();
  const metadata = EXECUTION_RESOLVER_BLUEPRINT.getMetadata();
  const resolver = EXECUTION_RESOLVER_BLUEPRINT.getResolver();

  assert(context !== undefined, 'getContext failed');
  assert(metadata !== undefined, 'getMetadata failed');
  assert(resolver !== undefined, 'getResolver failed');

  // Assert absence of dynamic resolver and execution methods on resolver model
  assert((resolver as any).resolve === undefined, 'No resolve method should exist on ExecutionResolver model');
  assert((resolver as any).lookup === undefined, 'No lookup method should exist on ExecutionResolver model');
  assert((resolver as any).search === undefined, 'No search method should exist on ExecutionResolver model');
  assert((resolver as any).match === undefined, 'No match method should exist on ExecutionResolver model');
  assert((resolver as any).evaluate === undefined, 'No evaluate method should exist on ExecutionResolver model');
  assert((resolver as any).dispatch === undefined, 'No dispatch method should exist on ExecutionResolver model');
  assert((resolver as any).execute === undefined, 'No execute method should exist on ExecutionResolver model');

  // Assert absence of dynamic resolver and execution methods on blueprint container
  assert((EXECUTION_RESOLVER_BLUEPRINT as any).resolve === undefined, 'No resolve method should exist on blueprint container');
  assert((EXECUTION_RESOLVER_BLUEPRINT as any).lookup === undefined, 'No lookup method should exist on blueprint container');
  assert((EXECUTION_RESOLVER_BLUEPRINT as any).search === undefined, 'No search method should exist on blueprint container');
  assert((EXECUTION_RESOLVER_BLUEPRINT as any).match === undefined, 'No match method should exist on blueprint container');
  assert((EXECUTION_RESOLVER_BLUEPRINT as any).evaluate === undefined, 'No evaluate method should exist on blueprint container');
  assert((EXECUTION_RESOLVER_BLUEPRINT as any).dispatch === undefined, 'No dispatch method should exist on blueprint container');
  assert((EXECUTION_RESOLVER_BLUEPRINT as any).execute === undefined, 'No execute method should exist on blueprint container');

  console.log('[Test 3] Resolver Getter APIs and declarative logic checks: PASSED');
}

// ==============================================================================
// 4. Deterministic Reference verification
// ==============================================================================
function testReferenceDeterminism() {
  console.log('[Test 4] Resolver referential determinism checks starting...');
  
  const r1 = EXECUTION_RESOLVER_BLUEPRINT.getResolver();
  const r2 = EXECUTION_RESOLVER_BLUEPRINT.getResolver();
  assert(r1 === r2, 'getResolver() must return the exact same frozen reference');

  const c1 = EXECUTION_RESOLVER_BLUEPRINT.getContext();
  const c2 = EXECUTION_RESOLVER_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext() must return the exact same frozen reference');

  const m1 = EXECUTION_RESOLVER_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_RESOLVER_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Resolver referential determinism checks: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const resolver = DevelopmentRules.getExecutionResolver(rule);
  assert(resolver !== undefined, 'getExecutionResolver should resolve statically');
  assert(resolver?.id === 'execution-resolver-01', 'Resolved resolver ID mismatch');
  assert(resolver?.resolverType === ResolverType.FOUNDATION, 'Resolved resolver type mismatch');
  assert(resolver?.strategy === ResolverStrategy.STATIC, 'Resolved resolver strategy mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const resolver2 = DevelopmentRules.getExecutionResolver(rule);
  assert(resolver === resolver2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionResolver(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testResolverEnums();
    testResolverStructureAndImmutability();
    testResolverGettersAndDeclarativeOnly();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Resolver Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
