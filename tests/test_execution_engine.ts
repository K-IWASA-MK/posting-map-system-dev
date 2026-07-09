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
import { EngineType, EXECUTION_ENGINE_BLUEPRINT } from '../src/execution/ExecutionEngine';
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

// ==============================================================================
// 1. EngineType and Enum verification
// ==============================================================================
function testEngineTypes() {
  console.log('[Test 1] EngineType Enum values verification starting...');
  assert(EngineType.FOUNDATION === 'FOUNDATION', 'FOUNDATION enum mismatch');
  assert(EngineType.RUNTIME === 'RUNTIME', 'RUNTIME enum mismatch');
  assert(EngineType.SIMULATION === 'SIMULATION', 'SIMULATION enum mismatch');
  assert(EngineType.PLUGIN === 'PLUGIN', 'PLUGIN enum mismatch');
  console.log('[Test 1] EngineType Enum values verification: PASSED');
}

// ==============================================================================
// 2. Blueprint values and Object.isFrozen immutability verification
// ==============================================================================
function testBlueprintStructureAndImmutability() {
  console.log('[Test 2] ExecutionEngineBlueprint structure and immutability verification starting...');
  
  // Immutability checks
  assert(Object.isFrozen(EXECUTION_ENGINE_BLUEPRINT), 'EXECUTION_ENGINE_BLUEPRINT itself must be frozen');
  
  const blueprint = EXECUTION_ENGINE_BLUEPRINT.getBlueprint();
  assert(Object.isFrozen(blueprint), 'getBlueprint() result must be frozen');
  assert(Object.isFrozen(blueprint.capabilities), 'capabilities list must be frozen');
  assert(Object.isFrozen(blueprint.interfaces), 'interfaces list must be frozen');
  assert(Object.isFrozen(blueprint.metadata), 'metadata block must be frozen');

  // Verify properties
  assert(blueprint.id === 'engine-execution-01', 'Engine ID mismatch');
  assert(blueprint.name === 'Foundation Execution Engine', 'Engine Name mismatch');
  assert(blueprint.engineType === EngineType.FOUNDATION, 'Engine Type mismatch');
  assert(blueprint.capabilities.length === 4, 'Capabilities size mismatch');
  assert(blueprint.capabilities[0] === 'Execution Planning', 'First capability mismatch');
  assert(blueprint.interfaces.includes('getBlueprint'), 'Interface descriptor list mismatch');
  
  // Verify metadata properties
  const metadata = EXECUTION_ENGINE_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 203-1', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionEngineBlueprint structure and immutability verification: PASSED');
}

// ==============================================================================
// 3. Blueprint Getter Methods & Pure Declarative validation
// ==============================================================================
function testBlueprintGettersAndDeclarativeOnly() {
  console.log('[Test 3] Blueprint Getter APIs and declarative logic checks starting...');
  
  const capabilities = EXECUTION_ENGINE_BLUEPRINT.getCapabilities();
  const interfaces = EXECUTION_ENGINE_BLUEPRINT.getInterfaces();
  const metadata = EXECUTION_ENGINE_BLUEPRINT.getMetadata();

  assert(capabilities !== undefined, 'getCapabilities failed');
  assert(interfaces !== undefined, 'getInterfaces failed');
  assert(metadata !== undefined, 'getMetadata failed');

  // No execution methods checks on both data model and blueprint container
  const blueprint = EXECUTION_ENGINE_BLUEPRINT.getBlueprint();
  assert((blueprint as any).execute === undefined, 'No execute method should exist on ExecutionEngine model');
  assert((blueprint as any).run === undefined, 'No run method should exist on ExecutionEngine model');
  assert((blueprint as any).dispatch === undefined, 'No dispatch method should exist on ExecutionEngine model');

  assert((EXECUTION_ENGINE_BLUEPRINT as any).execute === undefined, 'No execute method should exist on EXECUTION_ENGINE_BLUEPRINT container');
  assert((EXECUTION_ENGINE_BLUEPRINT as any).run === undefined, 'No run method should exist on EXECUTION_ENGINE_BLUEPRINT container');
  assert((EXECUTION_ENGINE_BLUEPRINT as any).dispatch === undefined, 'No dispatch method should exist on EXECUTION_ENGINE_BLUEPRINT container');

  console.log('[Test 3] Blueprint Getter APIs and declarative logic checks: PASSED');
}

// ==============================================================================
// 4. Deterministic Reference verification
// ==============================================================================
function testReferenceDeterminism() {
  console.log('[Test 4] Blueprint referential determinism checks starting...');
  
  const b1 = EXECUTION_ENGINE_BLUEPRINT.getBlueprint();
  const b2 = EXECUTION_ENGINE_BLUEPRINT.getBlueprint();
  assert(b1 === b2, 'getBlueprint() must return the exact same frozen reference');

  const c1 = EXECUTION_ENGINE_BLUEPRINT.getCapabilities();
  const c2 = EXECUTION_ENGINE_BLUEPRINT.getCapabilities();
  assert(c1 === c2, 'getCapabilities() must return the exact same frozen reference');

  const m1 = EXECUTION_ENGINE_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_ENGINE_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Blueprint referential determinism checks: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const engine = DevelopmentRules.getExecutionEngine(rule);
  assert(engine !== undefined, 'getExecutionEngine should resolve the engine descriptor statically');
  assert(engine?.id === 'engine-execution-01', 'Resolved engine ID mismatch');
  assert(engine?.engineType === EngineType.FOUNDATION, 'Resolved engine type mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const engine2 = DevelopmentRules.getExecutionEngine(rule);
  assert(engine === engine2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionEngine(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testEngineTypes();
    testBlueprintStructureAndImmutability();
    testBlueprintGettersAndDeclarativeOnly();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Engine Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
