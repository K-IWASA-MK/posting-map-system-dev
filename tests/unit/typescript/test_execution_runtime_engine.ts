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
import { EXECUTION_RUNTIME_ENGINE_BLUEPRINT, EngineManagerType, EngineManagerScope, RuntimeEngineType, EngineStep, RUNTIME_ENGINE_MODELS, ENGINE_SEQUENCE, EngineType } from '../../../src/execution/ExecutionRuntimeEngine';
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
function testEngineManagerStructureAndImmutability() {
  console.log('[Test 1] Engine Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_ENGINE_BLUEPRINT), 'EXECUTION_RUNTIME_ENGINE_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getExecutionRuntimeEngine();
  assert(Object.isFrozen(manager), 'Engine Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-engine-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Engine Manager Layer', 'Metadata layer mismatch');

  assert(EngineManagerType.FOUNDATION === 'FOUNDATION', 'Enum EngineManagerType check failed');
  assert(EngineManagerScope.SYSTEM === 'SYSTEM', 'Enum EngineManagerScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Engine Manager Context and Blueprint values checks
function testEngineManagerBlueprintValues() {
  console.log('[Test 2] Engine Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getExecutionRuntimeEngine();
  const context = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getData();

  assert(manager.id === 'runtime-engine-01', 'Engine Manager ID mismatch');
  assert(manager.context === context, 'Engine Manager context mismatch');
  assert(manager.data === data, 'Engine Manager data mismatch');

  // Verify context holds only runtimeEngineId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Engine Manager Context must hold exactly 1 property');
  assert(context.runtimeEngineId === 'runtime-engine-01', 'Context runtimeEngineId mismatch');

  // Verify engineModels are specified correctly
  assert(data.engineModels.length === 5, 'Engine models count must be exactly 5');
  assert(data.engineModels[0].engineType === RuntimeEngineType.SYSTEM_ENGINE, 'Engine model 1 mismatch');
  assert(data.engineModels[1].engineType === RuntimeEngineType.CORE_ENGINE, 'Engine model 2 mismatch');
  assert(data.engineModels[2].engineType === RuntimeEngineType.APPLICATION_ENGINE, 'Engine model 3 mismatch');
  assert(data.engineModels[3].engineType === RuntimeEngineType.PLUGIN_ENGINE, 'Engine model 4 mismatch');
  assert(data.engineModels[4].engineType === RuntimeEngineType.FIELD_ENGINE, 'Engine model 5 mismatch');

  // Verify each engine model has version 1.0, engineOrder, targetBlueprints and allowedSteps
  for (let i = 0; i < 5; i++) {
    const model = data.engineModels[i];
    assert(model.metadata.engineModelVersion === '1.0', `Engine model ${i} version mismatch`);
    assert(model.engineOrder === i + 1, `Engine model ${i} engineOrder mismatch`);
    assert(Object.isFrozen(model.targetBlueprints), `Engine model ${i} targetBlueprints must be frozen`);
    assert(model.allowedSteps === ENGINE_SEQUENCE, `Engine model ${i} allowedSteps mismatch`);
  }

  // Verify targetBlueprints setup (e.g. system engine targets executor-blueprint-id)
  assert(data.engineModels[0].targetBlueprints[0] === 'executor-blueprint-id', 'System engine targetBlueprints mismatch');

  // Verify ENGINE_SEQUENCE (REGISTER_BLUEPRINTS, VALIDATE_BLUEPRINTS, BUILD_ENGINE_SCHEMA, READY_FOR_INTERPRETER, ENGINE_SCHEMA_READY)
  const seq = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getEngineSequence();
  assert(seq === ENGINE_SEQUENCE, 'Engine sequence mismatch');
  assert(seq[0] === EngineStep.REGISTER_BLUEPRINTS, 'Seq 0 mismatch');
  assert(seq[1] === EngineStep.VALIDATE_BLUEPRINTS, 'Seq 1 mismatch');
  assert(seq[2] === EngineStep.BUILD_ENGINE_SCHEMA, 'Seq 2 mismatch');
  assert(seq[3] === EngineStep.READY_FOR_INTERPRETER, 'Seq 3 mismatch');
  assert(seq[4] === EngineStep.ENGINE_SCHEMA_READY, 'Seq 4 mismatch');

  // Verify static engine models list matches
  const list = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getEngineModels();
  assert(list === RUNTIME_ENGINE_MODELS, 'Engine models list object mismatch');
  assert(Object.isFrozen(list), 'Engine models list must be frozen');

  console.log('[Test 2] Engine Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Engine Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeEngine(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeEngine(rule);
  
  assert(manager1 !== undefined, 'Engine Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive engine manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeEngineManager() {
  console.log('[Test 4] Verifying total absence of active engine manager/execution/launcher/plugin/boot/initialize/interpret/execute/dispatch/shutdown/tick APIs...');

  const forbiddenMethods = [
    'boot', 'initialize', 'interpret', 'execute', 'dispatch', 'shutdown', 'tick',
    'instantiate', 'buildRuntime', 'compose', 'mount', 'attach', 'connect'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_ENGINE_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_ENGINE_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getExecutionRuntimeEngine();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeEngine object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active engine manager/execution/launcher/plugin/boot/initialize/interpret/execute/dispatch/shutdown/tick APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeEngine(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeEngine should return a valid result');
  assert(manager?.id === 'runtime-engine-01', 'Resolved engine manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeEngine(ruleWithoutPipeline) === undefined, 'Rules engine manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// 6. Compatibility Layer verification
function testCompatibilityLayer() {
  console.log('[Test 6] Verifying backward compatibility with the old getEngine() and EngineType APIs...');

  assert(EngineType.FOUNDATION === 'FOUNDATION', 'EngineType.FOUNDATION compatibility check failed');

  const oldEngine = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getEngine();
  assert(oldEngine !== undefined, 'getEngine() compatibility check failed');
  assert(oldEngine.id === 'runtime-engine-01', 'Old engine ID mismatch');
  assert(oldEngine.metadata.phase === 'Phase 206-1', 'Old metadata phase mismatch');
  assert(oldEngine.context.runtimeManagerId === 'runtime-manager-01', 'Old context runtimeManagerId mismatch');

  console.log('[Test 6] Backward compatibility check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testEngineManagerStructureAndImmutability();
    testEngineManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeEngineManager();
    testDevelopmentRulesIntegration();
    testCompatibilityLayer();
    console.log('\nAll Execution Runtime Engine Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
