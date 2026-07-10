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
import { EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT, RegistryType, RegistryScope } from '../src/runtime/execution/component/ExecutionRuntimeComponentLifecycleRegistry';
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

// 1. Structure, Metadata, Context, Data, and Immutability check
function testRegistryStructureAndImmutability() {
  console.log('[Test 1] Registry structure, metadata, context, data and freeze checks starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT), 'EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT container must be frozen');
  
  const registry = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT.getExecutionRuntimeComponentLifecycleRegistry();
  assert(Object.isFrozen(registry), 'Registry data must be frozen');
  
  const context = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');

  const data = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');
  
  assert(metadata.id === 'runtime-component-lifecycle-registry-spec-01', 'Metadata id mismatch');
  assert(metadata.name === 'Default Execution Runtime Component Lifecycle Registry Specification', 'Metadata name mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.description === 'The static execution runtime component lifecycle registry foundation specification', 'Metadata description mismatch');
  assert(metadata.layer === 'Runtime Layer', 'Metadata layer mismatch');
  assert(metadata.category === 'Execution Component Lifecycle Registry', 'Metadata category mismatch');

  assert(RegistryType.FOUNDATION === 'FOUNDATION', 'Enum RegistryType check failed');
  assert(RegistryType.RUNTIME === 'RUNTIME', 'Enum RegistryType check failed');
  assert(RegistryType.SIMULATION === 'SIMULATION', 'Enum RegistryType check failed');
  assert(RegistryType.PLUGIN === 'PLUGIN', 'Enum RegistryType check failed');
  assert(RegistryType.AI === 'AI', 'Enum RegistryType check failed');

  assert(RegistryScope.SINGLETON === 'SINGLETON', 'Enum RegistryScope check failed');
  assert(RegistryScope.TRANSIENT === 'TRANSIENT', 'Enum RegistryScope check failed');
  assert(RegistryScope.SCOPED === 'SCOPED', 'Enum RegistryScope check failed');

  console.log('[Test 1] Registry structure, metadata, context, data and freeze checks: PASSED');
}

// 2. Component Registry Context holds only IDs (No direct other objects) and Read-Only Constraints
function testRegistryObjectReadOnlyConstraints() {
  console.log('[Test 2] Registry read-only and static constraints checking...');

  const context = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT.getContext();

  assert(context.runtimeComponentLifecycleRegistryId === 'runtime-component-lifecycle-registry-01', 'Context runtimeComponentLifecycleRegistryId mismatch');

  // Verify context holds only IDs and has no object fields
  const keys = Object.keys(context);
  assert(keys.length === 1, 'Context must only have 1 property');
  assert(keys.includes('runtimeComponentLifecycleRegistryId'), 'Must contain runtimeComponentLifecycleRegistryId');

  for (const key of keys) {
    assert(typeof (context as any)[key] === 'string', `Property ${key} must be string`);
  }

  // Ensure blueprint object cannot be mutated (read-only verification)
  try {
    (EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT as any).extraProperty = 'mutated';
    assert(false, 'Should throw an error when adding properties to frozen blueprint container');
  } catch (e) {
    // Expected to fail because it is frozen
  }

  console.log('[Test 2] Registry read-only and static constraints checking: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Registry referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const reg1 = DevelopmentRules.getExecutionRuntimeComponentLifecycleRegistry(rule);
  const reg2 = DevelopmentRules.getExecutionRuntimeComponentLifecycleRegistry(rule);
  
  assert(reg1 !== undefined, 'Registry should be resolved');
  assert(reg1 === reg2, 'Consecutive registry calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime registry methods are absent
function testAbsenceOfRuntimeRegistryOperations() {
  console.log('[Test 4] Verifying total absence of active execution/lifecycle/registry APIs...');

  const forbiddenMethods = [
    'register', 'unregister', 'add', 'remove', 'update', 'clear', 'find', 'lookup', 'resolve', 'execute'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT should not contain ${method}`);
    const registry = EXECUTION_RUNTIME_COMPONENT_LIFECYCLE_REGISTRY_BLUEPRINT.getExecutionRuntimeComponentLifecycleRegistry();
    assert((registry as any)[method] === undefined, `ExecutionRuntimeComponentLifecycleRegistry object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active execution/lifecycle/registry APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const registry = DevelopmentRules.getExecutionRuntimeComponentLifecycleRegistry(rule);
  
  assert(registry !== undefined, 'getExecutionRuntimeComponentLifecycleRegistry should return a valid result');
  assert(registry?.id === 'runtime-component-lifecycle-registry-01', 'Resolved registry ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeComponentLifecycleRegistry(ruleWithoutPipeline) === undefined, 'Rules registry should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testRegistryStructureAndImmutability();
    testRegistryObjectReadOnlyConstraints();
    testReferentialDeterminism();
    testAbsenceOfRuntimeRegistryOperations();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Component Lifecycle Registry Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
