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
import { EXECUTION_RUNTIME_INSTANCE_BLUEPRINT, InstanceManagerType, InstanceManagerScope, RuntimeInstanceType, RUNTIME_INSTANCE_MODELS } from '../src/execution/ExecutionRuntimeInstance';
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

// 1. Structure and Immutability check
function testInstanceManagerStructureAndImmutability() {
  console.log('[Test 1] Instance Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_INSTANCE_BLUEPRINT), 'EXECUTION_RUNTIME_INSTANCE_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getExecutionRuntimeInstance();
  assert(Object.isFrozen(manager), 'Instance Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-instance-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Instance Manager Layer', 'Metadata layer mismatch');

  assert(InstanceManagerType.FOUNDATION === 'FOUNDATION', 'Enum InstanceManagerType check failed');
  assert(InstanceManagerScope.SYSTEM === 'SYSTEM', 'Enum InstanceManagerScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Instance Manager Context and Blueprint values checks
function testInstanceManagerBlueprintValues() {
  console.log('[Test 2] Instance Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getExecutionRuntimeInstance();
  const context = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getData();

  assert(manager.id === 'runtime-instance-01', 'Instance Manager ID mismatch');
  assert(manager.context === context, 'Instance Manager context mismatch');
  assert(manager.data === data, 'Instance Manager data mismatch');

  // Verify context holds only runtimeInstanceId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Instance Manager Context must hold exactly 1 property');
  assert(context.runtimeInstanceId === 'runtime-instance-01', 'Context runtimeInstanceId mismatch');

  // Verify instanceModels are specified correctly
  assert(data.instanceModels.length === 5, 'Instance models count must be exactly 5');
  assert(data.instanceModels[0].instanceType === RuntimeInstanceType.SYSTEM_INSTANCE, 'Instance model 1 mismatch');
  assert(data.instanceModels[1].instanceType === RuntimeInstanceType.ENGINE_INSTANCE, 'Instance model 2 mismatch');
  assert(data.instanceModels[2].instanceType === RuntimeInstanceType.SERVICE_INSTANCE, 'Instance model 3 mismatch');
  assert(data.instanceModels[3].instanceType === RuntimeInstanceType.COMPONENT_INSTANCE, 'Instance model 4 mismatch');
  assert(data.instanceModels[4].instanceType === RuntimeInstanceType.APPLICATION_INSTANCE, 'Instance model 5 mismatch');

  // Verify each instance model has version 1.0
  assert(data.instanceModels[0].metadata.instanceModelVersion === '1.0', 'Instance model 1 version mismatch');
  assert(data.instanceModels[1].metadata.instanceModelVersion === '1.0', 'Instance model 2 version mismatch');
  assert(data.instanceModels[2].metadata.instanceModelVersion === '1.0', 'Instance model 3 version mismatch');
  assert(data.instanceModels[3].metadata.instanceModelVersion === '1.0', 'Instance model 4 version mismatch');
  assert(data.instanceModels[4].metadata.instanceModelVersion === '1.0', 'Instance model 5 version mismatch');

  // Verify static instance models list matches
  const list = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getInstanceModels();
  assert(list === RUNTIME_INSTANCE_MODELS, 'Instance models list object mismatch');
  assert(Object.isFrozen(list), 'Instance models list must be frozen');

  console.log('[Test 2] Instance Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Instance Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeInstance(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeInstance(rule);
  
  assert(manager1 !== undefined, 'Instance Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive instance manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeInstanceManager() {
  console.log('[Test 4] Verifying total absence of active instance manager/execution/launcher/plugin APIs...');

  const forbiddenMethods = [
    'createInstance', 'destroyInstance', 'startInstance', 'stopInstance', 'loadInstance', 'resolveDependencies',
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_INSTANCE_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_INSTANCE_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_INSTANCE_BLUEPRINT.getExecutionRuntimeInstance();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeInstance object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active instance manager/execution/launcher/plugin APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeInstance(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeInstance should return a valid result');
  assert(manager?.id === 'runtime-instance-01', 'Resolved instance manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeInstance(ruleWithoutPipeline) === undefined, 'Rules instance manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testInstanceManagerStructureAndImmutability();
    testInstanceManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeInstanceManager();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Instance Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
