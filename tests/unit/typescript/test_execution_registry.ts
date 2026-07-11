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
import { RegistryType, EXECUTION_REGISTRY_BLUEPRINT } from '../../../src/execution/ExecutionRegistry';
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
// 1. RegistryType and Enum verification
// ==============================================================================
function testRegistryTypes() {
  console.log('[Test 1] RegistryType Enum values verification starting...');
  assert(RegistryType.FOUNDATION === 'FOUNDATION', 'FOUNDATION enum mismatch');
  assert(RegistryType.RUNTIME === 'RUNTIME', 'RUNTIME enum mismatch');
  assert(RegistryType.PLUGIN === 'PLUGIN', 'PLUGIN enum mismatch');
  assert(RegistryType.SIMULATION === 'SIMULATION', 'SIMULATION enum mismatch');
  assert(RegistryType.AI === 'AI', 'AI enum mismatch');
  console.log('[Test 1] RegistryType Enum values verification: PASSED');
}

// ==============================================================================
// 2. Blueprint structure and three-layer Object.isFrozen immutability verification
// ==============================================================================
function testRegistryStructureAndImmutability() {
  console.log('[Test 2] ExecutionRegistryBlueprint structure and immutability verification starting...');
  
  // Immutability checks on blueprint container itself
  assert(Object.isFrozen(EXECUTION_REGISTRY_BLUEPRINT), 'EXECUTION_REGISTRY_BLUEPRINT itself must be frozen');
  
  const registry = EXECUTION_REGISTRY_BLUEPRINT.getRegistry();
  
  // Layer 1: Registry Model Freeze
  assert(Object.isFrozen(registry), 'getRegistry() result must be frozen');
  assert(Object.isFrozen(registry.metadata), 'Registry metadata must be frozen');

  // Layer 2: Entries Array Freeze
  assert(Object.isFrozen(registry.entries), 'Entries list array must be frozen');

  // Layer 3: Individual Entries & Entry Metadata Freeze
  for (const entry of registry.entries) {
    assert(Object.isFrozen(entry), 'Each entry must be frozen');
    assert(Object.isFrozen(entry.metadata), 'Each entry metadata must be frozen');
  }

  // Verify properties
  assert(registry.id === 'registry-execution-01', 'Registry ID mismatch');
  assert(registry.name === 'Foundation Execution Registry', 'Registry Name mismatch');
  assert(registry.entries.length === 2, 'Entries size mismatch');
  
  // Entry 1 specific property checks
  const entry1 = registry.entries[0];
  assert(entry1.id === 'execution-entry-01', 'Entry 1 ID mismatch');
  assert(entry1.capability === 'Testing', 'Entry 1 capability mismatch');
  assert(entry1.engineType === 'FOUNDATION', 'Entry 1 engine type mismatch');
  
  const metadata = EXECUTION_REGISTRY_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.phase === 'Phase 203-2', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionRegistryBlueprint structure and immutability verification: PASSED');
}

// ==============================================================================
// 3. Blueprint Getter APIs & declarative only validation
// ==============================================================================
function testRegistryGettersAndDeclarativeOnly() {
  console.log('[Test 3] Registry Getter APIs and declarative logic checks starting...');
  
  const entries = EXECUTION_REGISTRY_BLUEPRINT.getEntries();
  const metadata = EXECUTION_REGISTRY_BLUEPRINT.getMetadata();
  const registry = EXECUTION_REGISTRY_BLUEPRINT.getRegistry();

  assert(entries !== undefined && entries.length > 0, 'getEntries failed');
  assert(metadata !== undefined, 'getMetadata failed');
  assert(registry !== undefined, 'getRegistry failed');

  // Assert absence of dynamic manipulation and execution methods on registry model
  assert((registry as any).register === undefined, 'No register method should exist on ExecutionRegistry model');
  assert((registry as any).unregister === undefined, 'No unregister method should exist on ExecutionRegistry model');
  assert((registry as any).find === undefined, 'No find method should exist on ExecutionRegistry model');
  assert((registry as any).lookup === undefined, 'No lookup method should exist on ExecutionRegistry model');
  assert((registry as any).execute === undefined, 'No execute method should exist on ExecutionRegistry model');
  assert((registry as any).run === undefined, 'No run method should exist on ExecutionRegistry model');

  // Assert absence of dynamic manipulation and execution methods on blueprint container
  assert((EXECUTION_REGISTRY_BLUEPRINT as any).register === undefined, 'No register method should exist on blueprint container');
  assert((EXECUTION_REGISTRY_BLUEPRINT as any).unregister === undefined, 'No unregister method should exist on blueprint container');
  assert((EXECUTION_REGISTRY_BLUEPRINT as any).find === undefined, 'No find method should exist on blueprint container');
  assert((EXECUTION_REGISTRY_BLUEPRINT as any).lookup === undefined, 'No lookup method should exist on blueprint container');
  assert((EXECUTION_REGISTRY_BLUEPRINT as any).execute === undefined, 'No execute method should exist on blueprint container');
  assert((EXECUTION_REGISTRY_BLUEPRINT as any).run === undefined, 'No run method should exist on blueprint container');

  console.log('[Test 3] Registry Getter APIs and declarative logic checks: PASSED');
}

// ==============================================================================
// 4. Deterministic Reference verification
// ==============================================================================
function testReferenceDeterminism() {
  console.log('[Test 4] Registry referential determinism checks starting...');
  
  const r1 = EXECUTION_REGISTRY_BLUEPRINT.getRegistry();
  const r2 = EXECUTION_REGISTRY_BLUEPRINT.getRegistry();
  assert(r1 === r2, 'getRegistry() must return the exact same frozen reference');

  const e1 = EXECUTION_REGISTRY_BLUEPRINT.getEntries();
  const e2 = EXECUTION_REGISTRY_BLUEPRINT.getEntries();
  assert(e1 === e2, 'getEntries() must return the exact same frozen reference');

  const m1 = EXECUTION_REGISTRY_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_REGISTRY_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Registry referential determinism checks: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const registry = DevelopmentRules.getExecutionRegistry(rule);
  assert(registry !== undefined, 'getExecutionRegistry should resolve statically');
  assert(registry?.id === 'registry-execution-01', 'Resolved registry ID mismatch');
  assert(registry?.entries.length === 2, 'Resolved entries size mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const registry2 = DevelopmentRules.getExecutionRegistry(rule);
  assert(registry === registry2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRegistry(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testRegistryTypes();
    testRegistryStructureAndImmutability();
    testRegistryGettersAndDeclarativeOnly();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Registry Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
