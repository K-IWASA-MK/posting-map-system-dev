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
import { EXECUTION_RUNTIME_KERNEL_BLUEPRINT, KernelType, KernelScope, RuntimeKernelType, KernelStep, KernelLifecycleState, KernelCapability, KernelExecutionPolicy, RUNTIME_KERNEL_MODELS, KERNEL_SEQUENCE } from '../../../src/execution/ExecutionRuntimeKernel';
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
function testKernelManagerStructureAndImmutability() {
  console.log('[Test 1] Kernel Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_KERNEL_BLUEPRINT), 'EXECUTION_RUNTIME_KERNEL_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getExecutionRuntimeKernel();
  assert(Object.isFrozen(manager), 'Kernel Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-kernel-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Kernel Manager Layer', 'Metadata layer mismatch');

  assert(KernelType.FOUNDATION === 'FOUNDATION', 'Enum KernelType check failed');
  assert(KernelScope.SYSTEM === 'SYSTEM', 'Enum KernelScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Kernel Manager Context and Blueprint values checks
function testKernelManagerBlueprintValues() {
  console.log('[Test 2] Kernel Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getExecutionRuntimeKernel();
  const context = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getData();

  assert(manager.id === 'runtime-kernel-01', 'Kernel Manager ID mismatch');
  assert(manager.context === context, 'Kernel Manager context mismatch');
  assert(manager.data === data, 'Kernel Manager data mismatch');

  // Verify context holds only runtimeKernelId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Kernel Manager Context must hold exactly 1 property');
  assert(context.runtimeKernelId === 'runtime-kernel-01', 'Context runtimeKernelId mismatch');

  // Verify kernelModels are specified correctly
  assert(data.kernelModels.length === 5, 'Kernel models count must be exactly 5');
  assert(data.kernelModels[0].kernelType === RuntimeKernelType.SYSTEM_KERNEL, 'Kernel model 1 mismatch');
  assert(data.kernelModels[1].kernelType === RuntimeKernelType.CORE_KERNEL, 'Kernel model 2 mismatch');
  assert(data.kernelModels[2].kernelType === RuntimeKernelType.APPLICATION_KERNEL, 'Kernel model 3 mismatch');
  assert(data.kernelModels[3].kernelType === RuntimeKernelType.PLUGIN_KERNEL, 'Kernel model 4 mismatch');
  assert(data.kernelModels[4].kernelType === RuntimeKernelType.FIELD_KERNEL, 'Kernel model 5 mismatch');

  // Verify each kernel model has versions, kernelOrder, targetInterpretations, policy and allowedSteps
  for (let i = 0; i < 5; i++) {
    const model = data.kernelModels[i];
    assert(model.metadata.kernelModelVersion === '1.0', `Kernel model ${i} version mismatch`);
    assert(model.kernelOrder === i + 1, `Kernel model ${i} kernelOrder mismatch`);
    assert(Object.isFrozen(model.targetInterpretations), `Kernel model ${i} targetInterpretations must be frozen`);
    assert(Object.isFrozen(model.supportedExecutionModels), `Kernel model ${i} supportedExecutionModels must be frozen`);
    assert(Object.isFrozen(model.kernelExecutionPolicy), `Kernel model ${i} kernelExecutionPolicy must be frozen`);
    assert(Object.isFrozen(model.supportedCapabilities), `Kernel model ${i} supportedCapabilities must be frozen`);
    assert(model.allowedSteps === KERNEL_SEQUENCE, `Kernel model ${i} allowedSteps mismatch`);

    // Verify policies and capabilities
    assert(model.kernelExecutionPolicy.length === 5, `Policies count mismatch in model ${i}`);
    assert(model.kernelExecutionPolicy[0] === KernelExecutionPolicy.READ_ONLY, `Policy 0 mismatch in model ${i}`);
    assert(model.kernelExecutionPolicy[4] === KernelExecutionPolicy.NO_DYNAMIC_SCHEMA_CHANGE, `Policy 4 mismatch in model ${i}`);

    assert(model.supportedCapabilities.length === 5, `Capabilities count mismatch in model ${i}`);
    assert(model.supportedCapabilities[0] === KernelCapability.INTERPRETATION, `Capability 0 mismatch in model ${i}`);
    assert(model.supportedCapabilities[4] === KernelCapability.GOVERNANCE, `Capability 4 mismatch in model ${i}`);
  }

  // Verify targetInterpretations setup
  assert(data.kernelModels[0].targetInterpretations[0] === 'interpretation-model-boot-01', 'System kernel targetInterpretations mismatch');

  // Verify KERNEL_SEQUENCE
  const seq = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getKernelSequence();
  assert(seq === KERNEL_SEQUENCE, 'Kernel sequence mismatch');
  assert(seq[0] === KernelStep.REGISTER_INTERPRETATION, 'Seq 0 mismatch');
  assert(seq[1] === KernelStep.VALIDATE_INTERPRETATION, 'Seq 1 mismatch');
  assert(seq[2] === KernelStep.BUILD_KERNEL_SCHEMA, 'Seq 2 mismatch');
  assert(seq[3] === KernelStep.READY_FOR_RUNTIME, 'Seq 3 mismatch');
  assert(seq[4] === KernelStep.KERNEL_SCHEMA_READY, 'Seq 4 mismatch');

  // Verify static kernel models list matches
  const list = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getKernelModels();
  assert(list === RUNTIME_KERNEL_MODELS, 'Kernel models list object mismatch');
  assert(Object.isFrozen(list), 'Kernel models list must be frozen');

  console.log('[Test 2] Kernel Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Kernel Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeKernel(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeKernel(rule);
  
  assert(manager1 !== undefined, 'Kernel Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive kernel manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeKernelManager() {
  console.log('[Test 4] Verifying total absence of active kernel manager/execution/launcher/plugin/boot/initialize/run/execute/dispatch/schedule/tick/shutdown APIs...');

  const forbiddenMethods = [
    'boot', 'initialize', 'run', 'execute', 'dispatch', 'schedule', 'tick', 'shutdown',
    'interpret', 'parse', 'analyze', 'compile', 'resolve',
    'instantiate', 'buildRuntime', 'compose', 'mount', 'attach', 'connect'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_KERNEL_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_KERNEL_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getExecutionRuntimeKernel();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeKernel object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active kernel manager/execution/launcher/plugin/boot/initialize/run/execute/dispatch/schedule/tick/shutdown APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeKernel(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeKernel should return a valid result');
  assert(manager?.id === 'runtime-kernel-01', 'Resolved kernel manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeKernel(ruleWithoutPipeline) === undefined, 'Rules kernel manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// 6. Verification that Runtime Context / State / Session / Instance / Thread / Queue / Event are absent from the Kernel Blueprint
function testAbsenceOfRuntimeDataReferences() {
  console.log('[Test 6] Verifying that Kernel Blueprint holds NO dynamic context/state/session/instance/thread/queue/event references or properties...');

  const manager = EXECUTION_RUNTIME_KERNEL_BLUEPRINT.getExecutionRuntimeKernel();
  
  const forbiddenProperties = [
    'runtimeContext', 'runtimeState', 'runtimeSession', 'runtimeInstance', 'thread', 'queue', 'event',
    'contexts', 'states', 'sessions', 'instances', 'threads', 'queues', 'events',
    'activeContexts', 'activeStates', 'activeSessions', 'activeInstances', 'activeThreads', 'activeQueues', 'activeEvents'
  ];

  for (const prop of forbiddenProperties) {
    assert((manager as any)[prop] === undefined, `Kernel Manager should not hold property: ${prop}`);
    assert((EXECUTION_RUNTIME_KERNEL_BLUEPRINT as any)[prop] === undefined, `Blueprint Container should not hold property: ${prop}`);
  }

  // Lifecycle enum and Capability checks
  assert(KernelLifecycleState.CREATED === 'CREATED', 'KernelLifecycleState CREATED check failed');
  assert(KernelLifecycleState.RUNNING === 'RUNNING', 'KernelLifecycleState RUNNING check failed');
  assert(KernelCapability.INTERPRETATION === 'INTERPRETATION', 'KernelCapability INTERPRETATION check failed');
  assert(KernelCapability.GOVERNANCE === 'GOVERNANCE', 'KernelCapability GOVERNANCE check failed');

  console.log('[Test 6] Absence of dynamic runtime data references and enum validation: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testKernelManagerStructureAndImmutability();
    testKernelManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeKernelManager();
    testDevelopmentRulesIntegration();
    testAbsenceOfRuntimeDataReferences();
    console.log('\nAll Execution Runtime Kernel Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
