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
import { EXECUTION_RUNTIME_BUILDER_BLUEPRINT, BuilderType, BuilderScope, RuntimeBuildType, BuildStep, RUNTIME_BUILD_MODELS, BUILD_SEQUENCE } from '../../../src/execution/ExecutionRuntimeBuilder';
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
function testBuilderManagerStructureAndImmutability() {
  console.log('[Test 1] Builder Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_BUILDER_BLUEPRINT), 'EXECUTION_RUNTIME_BUILDER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getExecutionRuntimeBuilder();
  assert(Object.isFrozen(manager), 'Builder Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-builder-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Builder Manager Layer', 'Metadata layer mismatch');

  assert(BuilderType.FOUNDATION === 'FOUNDATION', 'Enum BuilderType check failed');
  assert(BuilderScope.SYSTEM === 'SYSTEM', 'Enum BuilderScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Builder Manager Context and Blueprint values checks
function testBuilderManagerBlueprintValues() {
  console.log('[Test 2] Builder Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getExecutionRuntimeBuilder();
  const context = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getData();

  assert(manager.id === 'runtime-builder-01', 'Builder Manager ID mismatch');
  assert(manager.context === context, 'Builder Manager context mismatch');
  assert(manager.data === data, 'Builder Manager data mismatch');

  // Verify context holds only runtimeBuilderId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Builder Manager Context must hold exactly 1 property');
  assert(context.runtimeBuilderId === 'runtime-builder-01', 'Context runtimeBuilderId mismatch');

  // Verify buildModels are specified correctly
  assert(data.buildModels.length === 5, 'Build models count must be exactly 5');
  assert(data.buildModels[0].buildType === RuntimeBuildType.SYSTEM_BUILD, 'Build model 1 mismatch');
  assert(data.buildModels[1].buildType === RuntimeBuildType.ENGINE_BUILD, 'Build model 2 mismatch');
  assert(data.buildModels[2].buildType === RuntimeBuildType.SERVICE_BUILD, 'Build model 3 mismatch');
  assert(data.buildModels[3].buildType === RuntimeBuildType.COMPONENT_BUILD, 'Build model 4 mismatch');
  assert(data.buildModels[4].buildType === RuntimeBuildType.APPLICATION_BUILD, 'Build model 5 mismatch');

  // Verify each build model has version 1.0, target blueprints and allowedSteps
  for (let i = 0; i < 5; i++) {
    const model = data.buildModels[i];
    assert(model.metadata.buildModelVersion === '1.0', `Build model ${i} version mismatch`);
    assert(model.targetBlueprints.length > 0, `Build model ${i} targetBlueprints must not be empty`);
    assert(Object.isFrozen(model.targetBlueprints), `Build model ${i} targetBlueprints must be frozen`);
    assert(model.allowedSteps === BUILD_SEQUENCE, `Build model ${i} allowedSteps mismatch`);
  }

  // Verify BUILD_SEQUENCE (LOAD_BLUEPRINTS, LOAD_RUNTIME_MODELS, VALIDATE_STRUCTURE, BUILD_RUNTIME_SCHEMA, READY_FOR_RUNTIME)
  const seq = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getBuildSequence();
  assert(seq === BUILD_SEQUENCE, 'Build sequence mismatch');
  assert(seq[0] === BuildStep.LOAD_BLUEPRINTS, 'Seq 0 mismatch');
  assert(seq[1] === BuildStep.LOAD_RUNTIME_MODELS, 'Seq 1 mismatch');
  assert(seq[2] === BuildStep.VALIDATE_STRUCTURE, 'Seq 2 mismatch');
  assert(seq[3] === BuildStep.BUILD_RUNTIME_SCHEMA, 'Seq 3 mismatch');
  assert(seq[4] === BuildStep.READY_FOR_RUNTIME, 'Seq 4 mismatch');

  // Verify static build models list matches
  const list = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getBuildModels();
  assert(list === RUNTIME_BUILD_MODELS, 'Build models list object mismatch');
  assert(Object.isFrozen(list), 'Build models list must be frozen');

  console.log('[Test 2] Builder Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Builder Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeBuilder(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeBuilder(rule);
  
  assert(manager1 !== undefined, 'Builder Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive builder manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeBuilderManager() {
  console.log('[Test 4] Verifying total absence of active builder manager/execution/launcher/plugin/compose/assemble/createRuntime/instantiate/build APIs...');

  const forbiddenMethods = [
    'build', 'compose', 'assemble', 'createRuntime', 'generateInstance', 'instantiate',
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_BUILDER_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_BUILDER_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_BUILDER_BLUEPRINT.getExecutionRuntimeBuilder();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeBuilder object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active builder manager/execution/launcher/plugin/compose/assemble/createRuntime/instantiate/build APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeBuilder(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeBuilder should return a valid result');
  assert(manager?.id === 'runtime-builder-01', 'Resolved builder manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeBuilder(ruleWithoutPipeline) === undefined, 'Rules builder manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testBuilderManagerStructureAndImmutability();
    testBuilderManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeBuilderManager();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Builder Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
