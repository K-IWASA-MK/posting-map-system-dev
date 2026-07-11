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
import { EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT, EventBusType, EventBusScope, RuntimeEventBusType, EventBusLifecycleState, EventBusExecutionPolicy, EventBusCapability, EventBusDependencyPolicy, EventBusChannelPolicy, EventBusTopology, EventBusDeliveryPolicy, EventBusReliabilityPolicy, EventBusCategory, RUNTIME_EVENT_BUS_MODELS, EVENT_BUS_SEQUENCE } from '../../../src/execution/ExecutionRuntimeEventBus';
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

  // Register Runtime
  const runtime = RuntimeFactory.create('TestRuntime', RuntimeState.CREATED, RuntimeMode.SANDBOX, 'Desc', '1.0.0');
  RuntimeRegistry.register(runtime);

  // Register Session
  const session = RuntimeSessionFactory.create('TestSession', 'runtime-1', 'Desc', RuntimeSessionState.CREATED);
  RuntimeSessionRegistry.register(session);

  // Register Context
  const context = RuntimeContextFactory.create('TestContext', 'session-1', 'Desc', RuntimeContextState.CREATED);
  RuntimeContextRegistry.register(context);

  // Register Queue
  const queue = RuntimeQueueFactory.create('TestQueue', 'context-1', 'Desc', RuntimeQueueState.CREATED, QueuePriority.NORMAL);
  RuntimeQueueRegistry.register(queue);

  // Register Task
  const task = RuntimeTaskFactory.create('TestTask', 'queue-1', RuntimeTaskType.VALIDATION, RuntimeTaskState.CREATED);
  RuntimeTaskRegistry.register(task);

  // Register Plan
  const plan = RuntimeExecutionPlanFactory.create('TestPlan', 'task-1', ExecutionStrategy.SEQUENTIAL, RuntimeExecutionPlanState.CREATED);
  RuntimeExecutionPlanRegistry.register(plan);

  // Register Graph
  const graph = RuntimeExecutionGraphFactory.create('TestGraph', ['plan-1'], RuntimeExecutionGraphState.CREATED);
  RuntimeExecutionGraphRegistry.register(graph);
}

// 1. Structure, Immutability, and Getter Only check
function testEventBusStructureAndImmutability() {
  console.log('[Test 1] Event Bus structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT), 'EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getExecutionRuntimeEventBus();
  assert(Object.isFrozen(manager), 'Event Bus Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Event Bus Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Event Bus Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Event Bus Data must be frozen');
  assert(Object.isFrozen(manager.data.eventBusModels), 'Event Bus Models must be frozen');
  assert(Object.isFrozen(EVENT_BUS_SEQUENCE), 'EVENT_BUS_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_EVENT_BUS_MODELS), 'RUNTIME_EVENT_BUS_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-event-bus-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Event Bus Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Event Bus Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testEventBusContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getContext();
  assert(context.runtimeEventBusId === 'runtime-event-bus-01', 'Context must have runtimeEventBusId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeEventBusId', 'Context must contain only runtimeEventBusId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No threads, schedulers, queues, tasks, workers, dispatchers, event loop, etc.)
function testEventBusRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getExecutionRuntimeEventBus();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'publish', 'subscribe', 'unsubscribe', 'broadcast', 'multicast', 
    'notify', 'route', 'dispatch', 'registerChannel', 'unregisterChannel',
    'thread', 'scheduler', 'queue', 'task', 'worker', 'dispatcher', 'event', 'eventLoop', 'kernel'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeEventBus data must not contain method or property: ${key}`);
  }

  // Check Event Bus Policies explicitly include NO_THREAD, NO_QUEUE, NO_SCHEDULER, NO_TASK, NO_WORKER, NO_DISPATCHER, NO_EVENT, NO_EVENT_LOOP, NO_EVENT_BUS, NO_PUBLISH, NO_SUBSCRIBE, NO_NOTIFICATION, NO_ROUTING, NO_CHANNEL_OPERATION
  const models = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getEventBusModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(EventBusExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_SCHEDULER), 'Must include NO_SCHEDULER policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_EVENT_LOOP), 'Must include NO_EVENT_LOOP policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_PUBLISH), 'Must include NO_PUBLISH policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_SUBSCRIBE), 'Must include NO_SUBSCRIBE policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_NOTIFICATION), 'Must include NO_NOTIFICATION policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_ROUTING), 'Must include NO_ROUTING policy');
    assert(policies.includes(EventBusExecutionPolicy.NO_CHANNEL_OPERATION), 'Must include NO_CHANNEL_OPERATION policy');
    
    // Check that supportedCapabilities, dependencyPolicy, channelPolicy, topology, deliveryPolicy, reliabilityPolicy, eventBusCategory exist and are immutable
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(model.dependencyPolicy !== undefined, 'dependencyPolicy must be defined');
    assert(model.channelPolicy !== undefined, 'channelPolicy must be defined');
    assert(model.topology !== undefined, 'topology must be defined');
    assert(model.deliveryPolicy !== undefined, 'deliveryPolicy must be defined');
    assert(model.reliabilityPolicy !== undefined, 'reliabilityPolicy must be defined');
    assert(model.eventBusCategory !== undefined, 'eventBusCategory must be defined');
    assert(model.metadata.eventBusSchemaVersion === '1.0', 'Invalid eventBusSchemaVersion');

    // Confirm that enums contain recommended values
    for (const cap of model.supportedCapabilities) {
      assert(Object.values(EventBusCapability).includes(cap), `Invalid capability: ${cap}`);
    }
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testEventBusDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getExecutionRuntimeEventBus();
  const m2 = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getExecutionRuntimeEventBus();
  assert(m1 === m2, 'getExecutionRuntimeEventBus must return identical references');

  const c1 = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const eventBus = DevelopmentRules.getExecutionRuntimeEventBus(rule);
  
  assert(eventBus !== undefined, 'getExecutionRuntimeEventBus must resolve properly');
  assert(eventBus === EXECUTION_RUNTIME_EVENT_BUS_BLUEPRINT.getExecutionRuntimeEventBus(), 'Resolved eventBus must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// Execute Tests
setupAllEnvironments();
testEventBusStructureAndImmutability();
testEventBusContextIdOnly();
testEventBusRuntimeLogicSeparation();
testEventBusDeterministicResolution();
testDevelopmentRulesIntegration();

console.log('\n======================================');
console.log('  ALL RUNTIME EVENT BUS TESTS PASSED');
console.log('======================================\n');
