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
import { EXECUTION_RUNTIME_SERVICE_BLUEPRINT, ServiceType } from '../../../src/execution/ExecutionRuntimeService';
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
function testServiceStructureAndImmutability() {
  console.log('[Test 1] Service metadata, context, and service structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_SERVICE_BLUEPRINT), 'EXECUTION_RUNTIME_SERVICE_BLUEPRINT container must be frozen');
  
  const service = EXECUTION_RUNTIME_SERVICE_BLUEPRINT.getService();
  assert(Object.isFrozen(service), 'Service data must be frozen');
  
  const context = EXECUTION_RUNTIME_SERVICE_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_SERVICE_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 207-1', 'Metadata phase mismatch');

  assert(ServiceType.FOUNDATION === 'FOUNDATION', 'Enum ServiceType check failed');
  assert(ServiceType.RUNTIME === 'RUNTIME', 'Enum ServiceType check failed');
  assert(ServiceType.SIMULATION === 'SIMULATION', 'Enum ServiceType check failed');
  assert(ServiceType.PLUGIN === 'PLUGIN', 'Enum ServiceType check failed');
  assert(ServiceType.AI === 'AI', 'Enum ServiceType check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Service Context holds only IDs (No direct Engine or other objects)
function testServiceObjectReadOnlyConstraints() {
  console.log('[Test 2] Service read-only and static constraints checking (No direct Engine or other objects)...');

  const context = EXECUTION_RUNTIME_SERVICE_BLUEPRINT.getContext();

  assert(context.runtimeServiceId === 'runtime-service-01', 'Context runtimeServiceId mismatch');
  assert(context.runtimeEngineId === 'runtime-engine-01', 'Context runtimeEngineId mismatch');
  assert(context.runtimeEngineRegistryId === 'runtime-engine-registry-01', 'Context runtimeEngineRegistryId mismatch');
  assert(context.runtimeEngineResolverId === 'runtime-engine-resolver-01', 'Context runtimeEngineResolverId mismatch');
  assert(context.runtimeEngineValidatorId === 'runtime-engine-validator-01', 'Context runtimeEngineValidatorId mismatch');
  assert(context.runtimeEngineDispatcherId === 'runtime-engine-dispatcher-01', 'Context runtimeEngineDispatcherId mismatch');
  assert(context.runtimeEngineSchedulerId === 'runtime-engine-scheduler-01', 'Context runtimeEngineSchedulerId mismatch');
  assert(context.runtimeEngineExecutorId === 'runtime-engine-executor-01', 'Context runtimeEngineExecutorId mismatch');

  // Verify context holds only IDs and has no object fields
  const keys = Object.keys(context);
  assert(keys.length === 8, 'Context must only have 8 properties');
  assert(keys.includes('runtimeServiceId'), 'Must contain runtimeServiceId');
  assert(keys.includes('runtimeEngineId'), 'Must contain runtimeEngineId');
  assert(keys.includes('runtimeEngineRegistryId'), 'Must contain runtimeEngineRegistryId');
  assert(keys.includes('runtimeEngineResolverId'), 'Must contain runtimeEngineResolverId');
  assert(keys.includes('runtimeEngineValidatorId'), 'Must contain runtimeEngineValidatorId');
  assert(keys.includes('runtimeEngineDispatcherId'), 'Must contain runtimeEngineDispatcherId');
  assert(keys.includes('runtimeEngineSchedulerId'), 'Must contain runtimeEngineSchedulerId');
  assert(keys.includes('runtimeEngineExecutorId'), 'Must contain runtimeEngineExecutorId');

  for (const key of keys) {
    assert(typeof (context as any)[key] === 'string', `Property ${key} must be string`);
  }

  console.log('[Test 2] Service read-only and static constraints checking: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Service referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const svc1 = DevelopmentRules.getExecutionRuntimeService(rule);
  const svc2 = DevelopmentRules.getExecutionRuntimeService(rule);
  
  assert(svc1 !== undefined, 'Service should be resolved');
  assert(svc1 === svc2, 'Consecutive service calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime/service methods are absent
function testAbsenceOfRuntimeServiceOperations() {
  console.log('[Test 4] Verifying total absence of active execution/service/timer/dispatcher APIs...');

  const forbiddenMethods = [
    'execute', 'run', 'start', 'stop', 'restart', 'invoke', 'dispatch', 'schedule', 'register', 'resolve', 'instantiate', 'load', 'unload'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_SERVICE_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_SERVICE_BLUEPRINT should not contain ${method}`);
    const service = EXECUTION_RUNTIME_SERVICE_BLUEPRINT.getService();
    assert((service as any)[method] === undefined, `ExecutionRuntimeService object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active execution/service/timer/dispatcher APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const service = DevelopmentRules.getExecutionRuntimeService(rule);
  
  assert(service !== undefined, 'getExecutionRuntimeService should return a valid result');
  assert(service?.id === 'runtime-service-foundation-01', 'Resolved service ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeService(ruleWithoutPipeline) === undefined, 'Rules service should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testServiceStructureAndImmutability();
    testServiceObjectReadOnlyConstraints();
    testReferentialDeterminism();
    testAbsenceOfRuntimeServiceOperations();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Service Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
