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
import { RuntimeRegistryType, EXECUTION_RUNTIME_REGISTRY_BLUEPRINT } from '../../../src/execution/ExecutionRuntimeRegistry';
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

// 1. Enum verification
function testRuntimeRegistryTypeEnum() {
  console.log('[Test 1] RuntimeRegistryType Enum values verification starting...');
  assert(RuntimeRegistryType.FOUNDATION === 'FOUNDATION', 'FOUNDATION enum mismatch');
  assert(RuntimeRegistryType.RUNTIME === 'RUNTIME', 'RUNTIME enum mismatch');
  assert(RuntimeRegistryType.SIMULATION === 'SIMULATION', 'SIMULATION enum mismatch');
  assert(RuntimeRegistryType.PLUGIN === 'PLUGIN', 'PLUGIN enum mismatch');
  assert(RuntimeRegistryType.AI === 'AI', 'AI enum mismatch');
  console.log('[Test 1] RuntimeRegistryType Enum values verification: PASSED');
}

// 2. Blueprint structure and Object.isFrozen verification
function testBlueprintStructureAndFreeze() {
  console.log('[Test 2] ExecutionRuntimeRegistryBlueprint structure and immutability verification starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_REGISTRY_BLUEPRINT), 'EXECUTION_RUNTIME_REGISTRY_BLUEPRINT must be frozen');
  
  const registry = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getRegistry();
  assert(Object.isFrozen(registry), 'getRegistry() must be frozen');
  assert(Object.isFrozen(registry.entries), 'entries array must be frozen');
  assert(Object.isFrozen(registry.entries[0]), 'entries[0] must be frozen');
  assert(Object.isFrozen(registry.entries[1]), 'entries[1] must be frozen');
  assert(Object.isFrozen(registry.metadata), 'registry metadata must be frozen');

  // Verify properties
  assert(registry.id === 'registry-runtime-01', 'Registry ID mismatch');
  assert(registry.name === 'Foundation Execution Runtime Registry', 'Registry Name mismatch');
  assert(registry.registryType === RuntimeRegistryType.FOUNDATION, 'Registry Type mismatch');
  assert(registry.entries.length === 2, 'Entries count mismatch');
  
  // Verify entry contents
  const entries = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getEntries();
  assert(entries[0].runtimeId === 'execution-runtime-01', 'Entry 1 runtimeId mismatch');
  assert(entries[0].runtimeType === 'FOUNDATION', 'Entry 1 runtimeType mismatch');
  assert(entries[1].runtimeId === 'execution-runtime-02', 'Entry 2 runtimeId mismatch');
  assert(entries[1].runtimeType === 'RUNTIME', 'Entry 2 runtimeType mismatch');

  // Verify metadata properties
  const metadata = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 204-2', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionRuntimeRegistryBlueprint structure and immutability verification: PASSED');
}

// 3. Getter API and Pure Declarative check (No register / lookup / resolve / etc.)
function testBlueprintGettersAndAbsenceOfRuntimeLogic() {
  console.log('[Test 3] Blueprint Getter APIs and runtime logic absence check starting...');

  const registry = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getRegistry();
  
  // Verify that active methods DO NOT exist on the model or the container
  const forbiddenMethods = [
    'register', 'unregister', 'lookup', 'search', 'resolve', 
    'hydrate', 'create', 'destroy', 'execute'
  ];

  for (const method of forbiddenMethods) {
    assert((registry as any)[method] === undefined, `Method ${method} should not exist on ExecutionRuntimeRegistry model`);
    assert((EXECUTION_RUNTIME_REGISTRY_BLUEPRINT as any)[method] === undefined, `Method ${method} should not exist on EXECUTION_RUNTIME_REGISTRY_BLUEPRINT container`);
  }

  console.log('[Test 3] Blueprint Getter APIs and runtime logic absence check: PASSED');
}

// 4. Deterministic Reference verification
function testReferenceDeterminism() {
  console.log('[Test 4] Blueprint referential determinism checks starting...');
  
  const r1 = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getRegistry();
  const r2 = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getRegistry();
  assert(r1 === r2, 'getRegistry() must return the exact same frozen reference');

  const e1 = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getEntries();
  const e2 = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getEntries();
  assert(e1 === e2, 'getEntries() must return the exact same frozen reference');

  const m1 = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Blueprint referential determinism checks: PASSED');
}

// 5. DevelopmentRules Static Mapping Integration Verification
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const registry = DevelopmentRules.getExecutionRuntimeRegistry(rule);
  assert(registry !== undefined, 'getExecutionRuntimeRegistry should resolve the registry descriptor statically');
  assert(registry?.id === 'registry-runtime-01', 'Resolved registry ID mismatch');
  assert(registry?.registryType === RuntimeRegistryType.FOUNDATION, 'Resolved registry type mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const registry2 = DevelopmentRules.getExecutionRuntimeRegistry(rule);
  assert(registry === registry2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeRegistry(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testRuntimeRegistryTypeEnum();
    testBlueprintStructureAndFreeze();
    testBlueprintGettersAndAbsenceOfRuntimeLogic();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Runtime Registry Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
