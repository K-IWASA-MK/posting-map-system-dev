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
import { EXECUTION_RUNTIME_COMPOSER_BLUEPRINT, ComposerType, ComposerScope, RuntimeCompositionType, CompositionStep, RUNTIME_COMPOSITION_MODELS, COMPOSITION_SEQUENCE } from '../../../src/execution/ExecutionRuntimeComposer';
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
function testComposerManagerStructureAndImmutability() {
  console.log('[Test 1] Composer Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_COMPOSER_BLUEPRINT), 'EXECUTION_RUNTIME_COMPOSER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getExecutionRuntimeComposer();
  assert(Object.isFrozen(manager), 'Composer Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-composer-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Composer Manager Layer', 'Metadata layer mismatch');

  assert(ComposerType.FOUNDATION === 'FOUNDATION', 'Enum ComposerType check failed');
  assert(ComposerScope.SYSTEM === 'SYSTEM', 'Enum ComposerScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Composer Manager Context and Blueprint values checks
function testComposerManagerBlueprintValues() {
  console.log('[Test 2] Composer Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getExecutionRuntimeComposer();
  const context = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getData();

  assert(manager.id === 'runtime-composer-01', 'Composer Manager ID mismatch');
  assert(manager.context === context, 'Composer Manager context mismatch');
  assert(manager.data === data, 'Composer Manager data mismatch');

  // Verify context holds only runtimeComposerId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Composer Manager Context must hold exactly 1 property');
  assert(context.runtimeComposerId === 'runtime-composer-01', 'Context runtimeComposerId mismatch');

  // Verify compositionModels are specified correctly
  assert(data.compositionModels.length === 5, 'Composition models count must be exactly 5');
  assert(data.compositionModels[0].compositionType === RuntimeCompositionType.SYSTEM_LAYOUT, 'Composition model 1 mismatch');
  assert(data.compositionModels[1].compositionType === RuntimeCompositionType.ENGINE_LAYOUT, 'Composition model 2 mismatch');
  assert(data.compositionModels[2].compositionType === RuntimeCompositionType.SERVICE_LAYOUT, 'Composition model 3 mismatch');
  assert(data.compositionModels[3].compositionType === RuntimeCompositionType.COMPONENT_LAYOUT, 'Composition model 4 mismatch');
  assert(data.compositionModels[4].compositionType === RuntimeCompositionType.APPLICATION_LAYOUT, 'Composition model 5 mismatch');

  // Verify each composition model has version 1.0, layoutOrder, connections and allowedSteps
  for (let i = 0; i < 5; i++) {
    const model = data.compositionModels[i];
    assert(model.metadata.compositionModelVersion === '1.0', `Composition model ${i} version mismatch`);
    assert(model.layoutOrder === i + 1, `Composition model ${i} layoutOrder mismatch`);
    assert(Object.isFrozen(model.connections), `Composition model ${i} connections must be frozen`);
    assert(model.allowedSteps === COMPOSITION_SEQUENCE, `Composition model ${i} allowedSteps mismatch`);
  }

  // Verify connections setup (e.g. system layout connects to engine layout)
  assert(data.compositionModels[0].connections[0] === 'engine-layout-blueprint-id', 'System layout connection mismatch');
  assert(data.compositionModels[4].connections.length === 0, 'Application layout connection mismatch (should be empty)');

  // Verify COMPOSITION_SEQUENCE
  const seq = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getCompositionSequence();
  assert(seq === COMPOSITION_SEQUENCE, 'Composition sequence mismatch');
  assert(seq[0] === CompositionStep.PREPARE_LAYOUT, 'Seq 0 mismatch');
  assert(seq[1] === CompositionStep.VALIDATE_LAYOUT, 'Seq 1 mismatch');
  assert(seq[2] === CompositionStep.COMPOSE_LAYOUT, 'Seq 2 mismatch');
  assert(seq[3] === CompositionStep.FINALIZE_LAYOUT, 'Seq 3 mismatch');
  assert(seq[4] === CompositionStep.READY_FOR_RUNTIME, 'Seq 4 mismatch');

  // Verify static composition models list matches
  const list = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getCompositionModels();
  assert(list === RUNTIME_COMPOSITION_MODELS, 'Composition models list object mismatch');
  assert(Object.isFrozen(list), 'Composition models list must be frozen');

  console.log('[Test 2] Composer Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Composer Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeComposer(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeComposer(rule);
  
  assert(manager1 !== undefined, 'Composer Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive composer manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeComposerManager() {
  console.log('[Test 4] Verifying total absence of active composer manager/execution/launcher/plugin/compose/mount/attach/connect/instantiate/buildRuntime APIs...');

  const forbiddenMethods = [
    'compose', 'mount', 'attach', 'connect', 'instantiate', 'buildRuntime',
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_COMPOSER_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_COMPOSER_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_COMPOSER_BLUEPRINT.getExecutionRuntimeComposer();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeComposer object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active composer manager/execution/launcher/plugin/compose/mount/attach/connect/instantiate/buildRuntime APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeComposer(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeComposer should return a valid result');
  assert(manager?.id === 'runtime-composer-01', 'Resolved composer manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeComposer(ruleWithoutPipeline) === undefined, 'Rules composer manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testComposerManagerStructureAndImmutability();
    testComposerManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeComposerManager();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Composer Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
