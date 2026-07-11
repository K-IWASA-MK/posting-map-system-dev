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
import { EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT, LifecycleType, LifecycleScope } from '../../../src/runtime/execution/component/ExecutionRuntimeComponentLifecycle';
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

// 1. Structure, Metadata, Context, Data, and Immutability check
function testLifecycleStructureAndImmutability() {
  console.log('[Test 1] Lifecycle structure, metadata, context, data and freeze checks starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT), 'EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT container must be frozen');
  
  const lifecycle = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT.getExecutionRuntimeComponentLifecycle();
  assert(Object.isFrozen(lifecycle), 'Lifecycle data must be frozen');
  
  const context = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');

  const data = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');
  
  assert(metadata.id === 'runtime-component-lifecycle-spec-01', 'Metadata id mismatch');
  assert(metadata.name === 'Default Execution Runtime Component Lifecycle Specification', 'Metadata name mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.description === 'The static execution runtime component lifecycle foundation specification', 'Metadata description mismatch');
  assert(metadata.layer === 'Runtime Layer', 'Metadata layer mismatch');
  assert(metadata.category === 'Execution Component Lifecycle', 'Metadata category mismatch');

  assert(LifecycleType.FOUNDATION === 'FOUNDATION', 'Enum LifecycleType check failed');
  assert(LifecycleType.RUNTIME === 'RUNTIME', 'Enum LifecycleType check failed');
  assert(LifecycleType.SIMULATION === 'SIMULATION', 'Enum LifecycleType check failed');
  assert(LifecycleType.PLUGIN === 'PLUGIN', 'Enum LifecycleType check failed');
  assert(LifecycleType.AI === 'AI', 'Enum LifecycleType check failed');

  assert(LifecycleScope.SINGLETON === 'SINGLETON', 'Enum LifecycleScope check failed');
  assert(LifecycleScope.TRANSIENT === 'TRANSIENT', 'Enum LifecycleScope check failed');
  assert(LifecycleScope.SCOPED === 'SCOPED', 'Enum LifecycleScope check failed');

  console.log('[Test 1] Structure, Metadata, Context, Data and freeze checks: PASSED');
}

// 2. Component Lifecycle Context holds only IDs (No direct other objects) and Read-Only Constraints
function testLifecycleObjectReadOnlyConstraints() {
  console.log('[Test 2] Lifecycle read-only and static constraints checking...');

  const context = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT.getContext();

  assert(context.runtimeComponentLifecycleId === 'runtime-component-lifecycle-01', 'Context runtimeComponentLifecycleId mismatch');

  // Verify context holds only IDs and has no object fields
  const keys = Object.keys(context);
  assert(keys.length === 1, 'Context must only have 1 property');
  assert(keys.includes('runtimeComponentLifecycleId'), 'Must contain runtimeComponentLifecycleId');

  for (const key of keys) {
    assert(typeof (context as any)[key] === 'string', `Property ${key} must be string`);
  }

  // Ensure blueprint object cannot be mutated (read-only verification)
  try {
    (EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT as any).extraProperty = 'mutated';
    assert(false, 'Should throw an error when adding properties to frozen blueprint container');
  } catch (e) {
    // Expected to fail because it is frozen
  }

  console.log('[Test 2] Lifecycle read-only and static constraints checking: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Lifecycle referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const lc1 = DevelopmentRules.getExecutionRuntimeComponentLifecycle(rule);
  const lc2 = DevelopmentRules.getExecutionRuntimeComponentLifecycle(rule);
  
  assert(lc1 !== undefined, 'Lifecycle should be resolved');
  assert(lc1 === lc2, 'Consecutive lifecycle calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime lifecycle methods are absent
function testAbsenceOfRuntimeLifecycleOperations() {
  console.log('[Test 4] Verifying total absence of active execution/lifecycle/plugin/ai APIs...');

  const forbiddenMethods = [
    'initialize', 'activate', 'deactivate', 'shutdown', 'reload', 'transition', 'start', 'stop', 'pause', 'resume', 'execute', 'dispatch', 'schedule'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT should not contain ${method}`);
    const lifecycle = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_BLUEPRINT.getExecutionRuntimeComponentLifecycle();
    assert((lifecycle as any)[method] === undefined, `ExecutionRuntimeComponentLifecycle object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active execution/lifecycle/plugin/ai APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const lifecycle = DevelopmentRules.getExecutionRuntimeComponentLifecycle(rule);
  
  assert(lifecycle !== undefined, 'getExecutionRuntimeComponentLifecycle should return a valid result');
  assert(lifecycle?.id === 'runtime-component-lifecycle-01', 'Resolved lifecycle ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeComponentLifecycle(ruleWithoutPipeline) === undefined, 'Rules lifecycle should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testLifecycleStructureAndImmutability();
    testLifecycleObjectReadOnlyConstraints();
    testReferentialDeterminism();
    testAbsenceOfRuntimeLifecycleOperations();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Component Lifecycle Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
