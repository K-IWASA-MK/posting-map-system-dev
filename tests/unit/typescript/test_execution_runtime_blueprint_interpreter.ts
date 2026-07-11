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
import { EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT, BlueprintInterpreterType, BlueprintInterpreterScope, RuntimeInterpretationType, InterpretationStep, InterpretationPolicy, RUNTIME_INTERPRETATION_MODELS, INTERPRETATION_SEQUENCE } from '../../../src/execution/ExecutionRuntimeBlueprintInterpreter';
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
function testInterpreterManagerStructureAndImmutability() {
  console.log('[Test 1] Interpreter Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT), 'EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getExecutionRuntimeBlueprintInterpreter();
  assert(Object.isFrozen(manager), 'Interpreter Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-blueprint-interpreter-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Blueprint Interpreter Manager Layer', 'Metadata layer mismatch');

  assert(BlueprintInterpreterType.FOUNDATION === 'FOUNDATION', 'Enum BlueprintInterpreterType check failed');
  assert(BlueprintInterpreterScope.SYSTEM === 'SYSTEM', 'Enum BlueprintInterpreterScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Interpreter Manager Context and Blueprint values checks
function testInterpreterManagerBlueprintValues() {
  console.log('[Test 2] Interpreter Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getExecutionRuntimeBlueprintInterpreter();
  const context = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getData();

  assert(manager.id === 'runtime-blueprint-interpreter-01', 'Interpreter Manager ID mismatch');
  assert(manager.context === context, 'Interpreter Manager context mismatch');
  assert(manager.data === data, 'Interpreter Manager data mismatch');

  // Verify context holds only runtimeBlueprintInterpreterId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Interpreter Manager Context must hold exactly 1 property');
  assert(context.runtimeBlueprintInterpreterId === 'runtime-blueprint-interpreter-01', 'Context runtimeBlueprintInterpreterId mismatch');

  // Verify interpretationModels are specified correctly
  assert(data.interpretationModels.length === 5, 'Interpretation models count must be exactly 5');
  assert(data.interpretationModels[0].interpretationType === RuntimeInterpretationType.BOOT_BLUEPRINT, 'Interpretation model 1 mismatch');
  assert(data.interpretationModels[1].interpretationType === RuntimeInterpretationType.ENGINE_BLUEPRINT, 'Interpretation model 2 mismatch');
  assert(data.interpretationModels[2].interpretationType === RuntimeInterpretationType.SERVICE_BLUEPRINT, 'Interpretation model 3 mismatch');
  assert(data.interpretationModels[3].interpretationType === RuntimeInterpretationType.COMPONENT_BLUEPRINT, 'Interpretation model 4 mismatch');
  assert(data.interpretationModels[4].interpretationType === RuntimeInterpretationType.APPLICATION_BLUEPRINT, 'Interpretation model 5 mismatch');

  // Verify each interpretation model has versions, interpretationOrder, targetBlueprints, policy and allowedSteps
  for (let i = 0; i < 5; i++) {
    const model = data.interpretationModels[i];
    assert(model.metadata.interpretationModelVersion === '1.0', `Interpretation model ${i} version mismatch`);
    assert(model.metadata.blueprintSchemaVersion === '1.0', `Blueprint schema version ${i} mismatch`);
    assert(model.interpretationOrder === i + 1, `Interpretation model ${i} interpretationOrder mismatch`);
    assert(Object.isFrozen(model.targetBlueprints), `Interpretation model ${i} targetBlueprints must be frozen`);
    assert(Object.isFrozen(model.supportedBlueprintTypes), `Interpretation model ${i} supportedBlueprintTypes must be frozen`);
    assert(Object.isFrozen(model.interpretationPolicy), `Interpretation model ${i} interpretationPolicy must be frozen`);
    assert(model.allowedSteps === INTERPRETATION_SEQUENCE, `Interpretation model ${i} allowedSteps mismatch`);

    // Verify policies
    assert(model.interpretationPolicy.length === 5, `Policies count mismatch in model ${i}`);
    assert(model.interpretationPolicy[0] === InterpretationPolicy.READ_ONLY, `Policy 0 mismatch in model ${i}`);
    assert(model.interpretationPolicy[4] === InterpretationPolicy.NO_RUNTIME_STATE, `Policy 4 mismatch in model ${i}`);
  }

  // Verify targetBlueprints setup
  assert(data.interpretationModels[0].targetBlueprints[0] === 'boot-blueprint-id', 'Boot interpretation targetBlueprints mismatch');

  // Verify INTERPRETATION_SEQUENCE (REGISTER_BLUEPRINT, VALIDATE_SCHEMA, BUILD_INTERPRETATION_SCHEMA, READY_FOR_KERNEL, INTERPRETATION_SCHEMA_READY)
  const seq = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getInterpretationSequence();
  assert(seq === INTERPRETATION_SEQUENCE, 'Interpretation sequence mismatch');
  assert(seq[0] === InterpretationStep.REGISTER_BLUEPRINT, 'Seq 0 mismatch');
  assert(seq[1] === InterpretationStep.VALIDATE_SCHEMA, 'Seq 1 mismatch');
  assert(seq[2] === InterpretationStep.BUILD_INTERPRETATION_SCHEMA, 'Seq 2 mismatch');
  assert(seq[3] === InterpretationStep.READY_FOR_KERNEL, 'Seq 3 mismatch');
  assert(seq[4] === InterpretationStep.INTERPRETATION_SCHEMA_READY, 'Seq 4 mismatch');

  // Verify static interpretation models list matches
  const list = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getInterpretationModels();
  assert(list === RUNTIME_INTERPRETATION_MODELS, 'Interpretation models list object mismatch');
  assert(Object.isFrozen(list), 'Interpretation models list must be frozen');

  console.log('[Test 2] Interpreter Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Interpreter Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeBlueprintInterpreter(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeBlueprintInterpreter(rule);
  
  assert(manager1 !== undefined, 'Interpreter Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive interpreter manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeInterpreterManager() {
  console.log('[Test 4] Verifying total absence of active interpreter manager/execution/launcher/plugin/interpret/parse/analyze/compile/resolve/execute APIs...');

  const forbiddenMethods = [
    'interpret', 'parse', 'analyze', 'compile', 'resolve', 'execute',
    'boot', 'initialize', 'dispatch', 'shutdown', 'tick',
    'instantiate', 'buildRuntime', 'compose', 'mount', 'attach', 'connect'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getExecutionRuntimeBlueprintInterpreter();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeBlueprintInterpreter object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active interpreter manager/execution/launcher/plugin/interpret/parse/analyze/compile/resolve/execute APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeBlueprintInterpreter(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeBlueprintInterpreter should return a valid result');
  assert(manager?.id === 'runtime-blueprint-interpreter-01', 'Resolved interpreter manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeBlueprintInterpreter(ruleWithoutPipeline) === undefined, 'Rules interpreter manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// 6. Verification that Runtime Context / State / Session / Instance are absent from the Interpreter Blueprint
function testAbsenceOfRuntimeDataReferences() {
  console.log('[Test 6] Verifying that Interpreter Blueprint holds NO dynamic context/state/session/instance references or properties...');

  const manager = EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT.getExecutionRuntimeBlueprintInterpreter();
  
  const forbiddenProperties = [
    'runtimeContext', 'runtimeState', 'runtimeSession', 'runtimeInstance',
    'contexts', 'states', 'sessions', 'instances',
    'activeContexts', 'activeStates', 'activeSessions', 'activeInstances'
  ];

  for (const prop of forbiddenProperties) {
    assert((manager as any)[prop] === undefined, `Interpreter Manager should not hold property: ${prop}`);
    assert((EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT as any)[prop] === undefined, `Blueprint Container should not hold property: ${prop}`);
  }

  console.log('[Test 6] Absence of dynamic runtime data references verification: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testInterpreterManagerStructureAndImmutability();
    testInterpreterManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeInterpreterManager();
    testDevelopmentRulesIntegration();
    testAbsenceOfRuntimeDataReferences();
    console.log('\nAll Execution Runtime Blueprint Interpreter Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
