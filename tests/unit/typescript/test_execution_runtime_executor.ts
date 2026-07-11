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
import { EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT, ExecutorType, ExecutorScope, RuntimeExecutionType, ExecutionStep, RUNTIME_EXECUTION_MODELS, EXECUTION_SEQUENCE } from '../../../src/execution/ExecutionRuntimeExecutor';
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
function testExecutorManagerStructureAndImmutability() {
  console.log('[Test 1] Executor Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT), 'EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getExecutionRuntimeExecutor();
  assert(Object.isFrozen(manager), 'Executor Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-executor-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Executor Manager Layer', 'Metadata layer mismatch');

  assert(ExecutorType.FOUNDATION === 'FOUNDATION', 'Enum ExecutorType check failed');
  assert(ExecutorScope.SYSTEM === 'SYSTEM', 'Enum ExecutorScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Executor Manager Context and Blueprint values checks
function testExecutorManagerBlueprintValues() {
  console.log('[Test 2] Executor Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getExecutionRuntimeExecutor();
  const context = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getData();

  assert(manager.id === 'runtime-executor-01', 'Executor Manager ID mismatch');
  assert(manager.context === context, 'Executor Manager context mismatch');
  assert(manager.data === data, 'Executor Manager data mismatch');

  // Verify context holds only runtimeExecutorId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Executor Manager Context must hold exactly 1 property');
  assert(context.runtimeExecutorId === 'runtime-executor-01', 'Context runtimeExecutorId mismatch');

  // Verify executionModels are specified correctly
  assert(data.executionModels.length === 5, 'Execution models count must be exactly 5');
  assert(data.executionModels[0].executionType === RuntimeExecutionType.SYSTEM_EXECUTION, 'Execution model 1 mismatch');
  assert(data.executionModels[1].executionType === RuntimeExecutionType.ENGINE_EXECUTION, 'Execution model 2 mismatch');
  assert(data.executionModels[2].executionType === RuntimeExecutionType.SERVICE_EXECUTION, 'Execution model 3 mismatch');
  assert(data.executionModels[3].executionType === RuntimeExecutionType.COMPONENT_EXECUTION, 'Execution model 4 mismatch');
  assert(data.executionModels[4].executionType === RuntimeExecutionType.APPLICATION_EXECUTION, 'Execution model 5 mismatch');

  // Verify each execution model has version 1.0, executionOrder, targetLayouts and allowedSteps
  for (let i = 0; i < 5; i++) {
    const model = data.executionModels[i];
    assert(model.metadata.executionModelVersion === '1.0', `Execution model ${i} version mismatch`);
    assert(model.executionOrder === i + 1, `Execution model ${i} executionOrder mismatch`);
    assert(Object.isFrozen(model.targetLayouts), `Execution model ${i} targetLayouts must be frozen`);
    assert(model.allowedSteps === EXECUTION_SEQUENCE, `Execution model ${i} allowedSteps mismatch`);
  }

  // Verify targetLayouts setup (e.g. system execution targets system-layout-blueprint-id)
  assert(data.executionModels[0].targetLayouts[0] === 'system-layout-blueprint-id', 'System execution targetLayouts mismatch');

  // Verify EXECUTION_SEQUENCE (VALIDATE_LAYOUT, PREPARE_EXECUTION, BUILD_EXECUTION_SCHEMA, READY_FOR_EXECUTION, EXECUTION_SCHEMA_READY)
  const seq = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getExecutionSequence();
  assert(seq === EXECUTION_SEQUENCE, 'Execution sequence mismatch');
  assert(seq[0] === ExecutionStep.VALIDATE_LAYOUT, 'Seq 0 mismatch');
  assert(seq[1] === ExecutionStep.PREPARE_EXECUTION, 'Seq 1 mismatch');
  assert(seq[2] === ExecutionStep.BUILD_EXECUTION_SCHEMA, 'Seq 2 mismatch');
  assert(seq[3] === ExecutionStep.READY_FOR_EXECUTION, 'Seq 3 mismatch');
  assert(seq[4] === ExecutionStep.EXECUTION_SCHEMA_READY, 'Seq 4 mismatch');

  // Verify static execution models list matches
  const list = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getExecutionModels();
  assert(list === RUNTIME_EXECUTION_MODELS, 'Execution models list object mismatch');
  assert(Object.isFrozen(list), 'Execution models list must be frozen');

  console.log('[Test 2] Executor Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Executor Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeExecutor(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeExecutor(rule);
  
  assert(manager1 !== undefined, 'Executor Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive executor manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeExecutorManager() {
  console.log('[Test 4] Verifying total absence of active executor manager/execution/launcher/plugin/execute/run/start/stop/shutdown/tick APIs...');

  const forbiddenMethods = [
    'execute', 'run', 'start', 'stop', 'shutdown', 'restart', 'tick',
    'instantiate', 'buildRuntime', 'compose', 'mount', 'attach', 'connect'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_EXECUTOR_BLUEPRINT.getExecutionRuntimeExecutor();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeExecutor object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active executor manager/execution/launcher/plugin/execute/run/start/stop/shutdown/tick APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeExecutor(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeExecutor should return a valid result');
  assert(manager?.id === 'runtime-executor-01', 'Resolved executor manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeExecutor(ruleWithoutPipeline) === undefined, 'Rules executor manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testExecutorManagerStructureAndImmutability();
    testExecutorManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeExecutorManager();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Executor Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
