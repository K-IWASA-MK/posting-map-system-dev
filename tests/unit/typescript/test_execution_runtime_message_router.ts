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
import { EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT, RouterType, RouterScope, RuntimeMessageRouterType, RouterLifecycleState, RouterCapability, RoutingStrategy, RoutingPolicy, RouterDependencyPolicy, RouterTopology, RouterReliabilityPolicy, RouterCategory, RouterSelectionPolicy, RouterTransportPolicy, RouterSecurityPolicy, RUNTIME_MESSAGE_ROUTER_MODELS, MESSAGE_ROUTER_SEQUENCE } from '../../../src/execution/ExecutionRuntimeMessageRouter';
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
function testRouterStructureAndImmutability() {
  console.log('[Test 1] Router structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT), 'EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getExecutionRuntimeMessageRouter();
  assert(Object.isFrozen(manager), 'Router Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Router Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Router Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Router Data must be frozen');
  assert(Object.isFrozen(manager.data.routerModels), 'Router Models must be frozen');
  assert(Object.isFrozen(MESSAGE_ROUTER_SEQUENCE), 'MESSAGE_ROUTER_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_MESSAGE_ROUTER_MODELS), 'RUNTIME_MESSAGE_ROUTER_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-router-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Message Router Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Message Router Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testRouterContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getContext();
  assert(context.runtimeMessageRouterId === 'runtime-message-router-01', 'Context must have runtimeMessageRouterId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeMessageRouterId', 'Context must contain only runtimeMessageRouterId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No threads, schedulers, queues, tasks, workers, dispatchers, event loop, etc.)
function testRouterRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getExecutionRuntimeMessageRouter();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'route', 'forward', 'redirect', 'deliver', 'resolve', 'multicast', 'broadcast', 'retry', 'failover',
    'thread', 'scheduler', 'queue', 'task', 'worker', 'dispatcher', 'event', 'eventBus', 'eventLoop', 'kernel', 'transport'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeMessageRouter data must not contain method or property: ${key}`);
  }

  // Check Router Policies explicitly include NO_THREAD, NO_QUEUE, NO_SCHEDULER, NO_TASK, NO_WORKER, NO_DISPATCHER, NO_EVENT, NO_EVENT_BUS, NO_TRANSPORT, NO_ROUTE, NO_FORWARD, NO_REDIRECT, NO_FAILOVER, NO_LOAD_BALANCING
  const models = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getRouterModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(RoutingPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(RoutingPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(RoutingPolicy.NO_SCHEDULER), 'Must include NO_SCHEDULER policy');
    assert(policies.includes(RoutingPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(RoutingPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(RoutingPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(RoutingPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(RoutingPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(RoutingPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(RoutingPolicy.NO_ROUTE), 'Must include NO_ROUTE policy');
    assert(policies.includes(RoutingPolicy.NO_FORWARD), 'Must include NO_FORWARD policy');
    assert(policies.includes(RoutingPolicy.NO_REDIRECT), 'Must include NO_REDIRECT policy');
    assert(policies.includes(RoutingPolicy.NO_FAILOVER), 'Must include NO_FAILOVER policy');
    assert(policies.includes(RoutingPolicy.NO_LOAD_BALANCING), 'Must include NO_LOAD_BALANCING policy');
    
    // Check that supportedCapabilities, dependencyPolicy, topology, reliabilityPolicy, routerCategory exist and are immutable
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(model.dependencyPolicy !== undefined, 'dependencyPolicy must be defined');
    assert(model.topology !== undefined, 'topology must be defined');
    assert(model.reliabilityPolicy !== undefined, 'reliabilityPolicy must be defined');
    assert(model.routerCategory !== undefined, 'routerCategory must be defined');
    assert(model.selectionPolicy !== undefined, 'selectionPolicy must be defined');
    assert(model.transportPolicy !== undefined, 'transportPolicy must be defined');
    assert(model.securityPolicy !== undefined, 'securityPolicy must be defined');
    assert(model.metadata.routerSchemaVersion === '1.0', 'Invalid routerSchemaVersion');

    // Confirm that enums contain recommended values
    for (const cap of model.supportedCapabilities) {
      assert(Object.values(RouterCapability).includes(cap), `Invalid capability: ${cap}`);
    }
    assert(Object.values(RouterTopology).includes(model.topology), 'Invalid topology');
    assert(Object.values(RouterReliabilityPolicy).includes(model.reliabilityPolicy), 'Invalid reliabilityPolicy');
    assert(Object.values(RouterCategory).includes(model.routerCategory), 'Invalid routerCategory');
    assert(Object.values(RouterSelectionPolicy).includes(model.selectionPolicy), 'Invalid selectionPolicy');
    assert(Object.values(RouterTransportPolicy).includes(model.transportPolicy), 'Invalid transportPolicy');
    assert(Object.values(RouterSecurityPolicy).includes(model.securityPolicy), 'Invalid securityPolicy');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testRouterDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getExecutionRuntimeMessageRouter();
  const m2 = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getExecutionRuntimeMessageRouter();
  assert(m1 === m2, 'getExecutionRuntimeMessageRouter must return identical references');

  const c1 = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const router = DevelopmentRules.getExecutionRuntimeMessageRouter(rule);
  
  assert(router !== undefined, 'getExecutionRuntimeMessageRouter must resolve properly');
  assert(router === EXECUTION_RUNTIME_MESSAGE_ROUTER_BLUEPRINT.getExecutionRuntimeMessageRouter(), 'Resolved router must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// Execute Tests
setupAllEnvironments();
testRouterStructureAndImmutability();
testRouterContextIdOnly();
testRouterRuntimeLogicSeparation();
testRouterDeterministicResolution();
testDevelopmentRulesIntegration();

console.log('\n==========================================');
console.log('  ALL RUNTIME MESSAGE ROUTER TESTS PASSED');
console.log('==========================================\n');
