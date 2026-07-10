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
import { EXECUTION_RUNTIME_ROUTING_BLUEPRINT, RoutingType, RoutingScope, RuntimeRoutingType, RoutingLifecycleState, RoutingCapability, RoutingCategory, RoutingValidationPolicy, RoutingExecutionPolicy, RoutingDependencyPolicy, RoutingTopology, RUNTIME_ROUTING_MODELS, ROUTING_SEQUENCE } from '../src/execution/ExecutionRuntimeRouting';
import { DevelopmentRules } from '../src/aios/DevelopmentRules';

// Node modules used for static source code scan
const fs = require('fs');
const path = require('path');

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
function testRoutingStructureAndImmutability() {
  console.log('[Test 1] Routing structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_ROUTING_BLUEPRINT), 'EXECUTION_RUNTIME_ROUTING_BLUEPRINT container must be frozen');
  
  const routing = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getExecutionRuntimeRouting();
  assert(Object.isFrozen(routing), 'Routing must be frozen');
  assert(Object.isFrozen(routing.metadata), 'Routing Metadata must be frozen');
  assert(Object.isFrozen(routing.context), 'Routing Context must be frozen');
  assert(Object.isFrozen(routing.data), 'Routing Data must be frozen');
  assert(Object.isFrozen(routing.data.routingModels), 'Routing Models array must be frozen');
  assert(Object.isFrozen(ROUTING_SEQUENCE), 'ROUTING_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_ROUTING_MODELS), 'RUNTIME_ROUTING_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-routing-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'ExecutionRuntimeRoutingMetadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'RoutingLayer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testRoutingContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getContext();
  assert(context.runtimeRoutingId === 'runtime-routing-01', 'Context must have runtimeRoutingId');
  
  // Verify that context does NOT contain any direct references or buffers/queues/channels
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeRoutingId', 'Context must contain only runtimeRoutingId');
  
  const forbiddenContextKeys = [
    'routingRef', 'routeTable', 'messageRef', 'queueRef', 'portRef', 'endpointRef', 'connectionRef', 'transportRef', 'state', 'cache', 'pointer', 'checksum'
  ];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testRoutingRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_ROUTING_BLUEPRINT;
  const routing: any = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getExecutionRuntimeRouting();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createRoute', 'generateRoute', 'resolveRoute', 'selectRoute', 'calculateRoute', 'updateRoute', 'addRoute', 'removeRoute', 'route', 'forward', 'redirect', 'dispatch',
    'fd', 'descriptor', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_ROUTING_BLUEPRINT must not contain: ${key}`);
    assert(routing[key] === undefined, `ExecutionRuntimeRouting must not contain: ${key}`);
  }

  // Check Routing Policies
  const models = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getRoutingModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(RoutingExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_CREATE), 'Must include NO_ROUTE_CREATE policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_RESOLVE), 'Must include NO_ROUTE_RESOLVE policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_REGISTER), 'Must include NO_ROUTE_REGISTER policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_OPEN), 'Must include NO_ROUTE_OPEN policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_CLOSE), 'Must include NO_ROUTE_CLOSE policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_SELECT), 'Must include NO_ROUTE_SELECT policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_FORWARD), 'Must include NO_ROUTE_FORWARD policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_REDIRECT), 'Must include NO_ROUTE_REDIRECT policy');
    assert(policies.includes(RoutingExecutionPolicy.NO_ROUTE_DISPATCH), 'Must include NO_ROUTE_DISPATCH policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedRoutingPolicies), 'supportedRoutingPolicies must be frozen');
    assert(Object.isFrozen(model.supportedValidationPolicies), 'supportedValidationPolicies must be frozen');
    assert(Object.isFrozen(model.lifecycleStates), 'lifecycleStates must be frozen');
    assert(Object.isFrozen(model.executionPolicies), 'executionPolicies must be frozen');
    assert(Object.isFrozen(model.allowedSteps), 'allowedSteps must be frozen');
    assert(Object.isFrozen(model.supportedTransportPolicies), 'supportedTransportPolicies must be frozen');
    assert(Object.isFrozen(model.supportedConnectionPolicies), 'supportedConnectionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedIdentityPolicies), 'supportedIdentityPolicies must be frozen');
    assert(Object.isFrozen(model.metadata), 'model metadata must be frozen');
    assert(Object.isFrozen(model), 'model must be frozen');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testRoutingDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const b1 = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getExecutionRuntimeRouting();
  const b2 = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getExecutionRuntimeRouting();
  assert(b1 === b2, 'getExecutionRuntimeRouting must return identical references');

  const c1 = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const routing = DevelopmentRules.getExecutionRuntimeRouting(rule);
  
  assert(routing !== undefined, 'getExecutionRuntimeRouting must resolve properly');
  assert(routing === EXECUTION_RUNTIME_ROUTING_BLUEPRINT.getExecutionRuntimeRouting(), 'Resolved routing must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeRouting.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreateRoute\s*\(/, name: 'createRoute()' },
    { pattern: /\bgenerateRoute\s*\(/, name: 'generateRoute()' },
    { pattern: /\bresolveRoute\s*\(/, name: 'resolveRoute()' },
    { pattern: /\bselectRoute\s*\(/, name: 'selectRoute()' },
    { pattern: /\bcalculateRoute\s*\(/, name: 'calculateRoute()' },
    { pattern: /\bupdateRoute\s*\(/, name: 'updateRoute()' },
    { pattern: /\baddRoute\s*\(/, name: 'addRoute()' },
    { pattern: /\bremoveRoute\s*\(/, name: 'removeRoute()' },
    { pattern: /\broute\s*\(/, name: 'route()' },
    { pattern: /\bforward\s*\(/, name: 'forward()' },
    { pattern: /\bredirect\s*\(/, name: 'redirect()' },
    { pattern: /\bdispatch\s*\(/, name: 'dispatch()' },
    { pattern: /\bPromise\b/, name: 'Promise' },
    { pattern: /\basync\b/, name: 'async' },
    { pattern: /\bawait\b/, name: 'await' },
    { pattern: /\bsetTimeout\b/, name: 'setTimeout' },
    { pattern: /\bsetInterval\b/, name: 'setInterval' },
    { pattern: /\bTimer\b/, name: 'Timer' },
    { pattern: /\bEventEmitter\b/, name: 'EventEmitter' },
    { pattern: /\bSocket\b/, name: 'Socket' },
    { pattern: /\bStream\b/, name: 'Stream' },
    { pattern: /\bBuffer\b/, name: 'Buffer' },
    { pattern: /\bConnection\b/, name: 'Connection' },
    { pattern: /\bTransport\b/, name: 'Transport' },
    { pattern: /\bEndpoint\b/, name: 'Endpoint' },
    { pattern: /\bPort\b/, name: 'Port' },
    { pattern: /\bQueue\b/, name: 'Queue' },
    { pattern: /\bMessage\b/, name: 'Message' },
    { pattern: /\bWorker\b/, name: 'Worker' },
    { pattern: /\bThread\b/, name: 'Thread' },
    { pattern: /\bEvent\b/, name: 'Event' },
    { pattern: /\bnet\./, name: 'net.' },
    { pattern: /\btls\./, name: 'tls.' },
    { pattern: /\bdgram\b/, name: 'dgram' },
    { pattern: /\bhttp\./, name: 'http.' },
    { pattern: /\bhttps\./, name: 'https.' },
    { pattern: /\bWebSocket\b/, name: 'WebSocket' },
    { pattern: /\bfetch\s*\(/, name: 'fetch(' },
    { pattern: /\bXMLHttpRequest\b/, name: 'XMLHttpRequest' }
  ];

  for (const item of forbiddenPatterns) {
    assert(!item.pattern.test(content), `Source code contains forbidden pattern: ${item.name}`);
  }

  console.log('[Test 6] PASSED');
}

// Execute Tests
setupAllEnvironments();
testRoutingStructureAndImmutability();
testRoutingContextIdOnly();
testRoutingRuntimeLogicSeparation();
testRoutingDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME ROUTING TESTS PASSED');
console.log('======================================\n');
