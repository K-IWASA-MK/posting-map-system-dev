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
import { EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT, EndpointType, EndpointScope, RuntimeEndpointType, EndpointLifecycleState, EndpointCapability, EndpointCategory, EndpointAddressPolicy, EndpointResolutionPolicy, EndpointValidationPolicy, EndpointExecutionPolicy, EndpointDependencyPolicy, EndpointTopology, RUNTIME_ENDPOINT_MODELS, ENDPOINT_SEQUENCE } from '../../../src/execution/ExecutionRuntimeEndpoint';
import { DevelopmentRules } from '../../../src/aios/DevelopmentRules';

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
function testEndpointStructureAndImmutability() {
  console.log('[Test 1] Endpoint structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT), 'EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT container must be frozen');
  
  const endpoint = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getExecutionRuntimeEndpoint();
  assert(Object.isFrozen(endpoint), 'Endpoint must be frozen');
  assert(Object.isFrozen(endpoint.metadata), 'Endpoint Metadata must be frozen');
  assert(Object.isFrozen(endpoint.context), 'Endpoint Context must be frozen');
  assert(Object.isFrozen(endpoint.data), 'Endpoint Data must be frozen');
  assert(Object.isFrozen(endpoint.data.endpointModels), 'Endpoint Models array must be frozen');
  assert(Object.isFrozen(ENDPOINT_SEQUENCE), 'ENDPOINT_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_ENDPOINT_MODELS), 'RUNTIME_ENDPOINT_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-endpoint-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'ExecutionRuntimeEndpointMetadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'EndpointLayer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testEndpointContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getContext();
  assert(context.runtimeEndpointId === 'runtime-endpoint-01', 'Context must have runtimeEndpointId');
  
  // Verify that context does NOT contain any direct references or host/port/url
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeEndpointId', 'Context must contain only runtimeEndpointId');
  
  const forbiddenContextKeys = [
    'endpointRef', 'transportRef', 'connectionRef', 'socketRef', 'address', 'host', 'port', 'hostname', 'url', 'path', 'target', 'pointer', 'checksum'
  ];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testEndpointRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT;
  const endpoint: any = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getExecutionRuntimeEndpoint();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createEndpoint', 'generateEndpoint', 'resolveEndpoint', 'registerEndpoint', 'openEndpoint', 'closeEndpoint', 'bindEndpoint', 'lookupEndpoint', 'discoverEndpoint', 'connectEndpoint',
    'fd', 'descriptor', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT must not contain: ${key}`);
    assert(endpoint[key] === undefined, `ExecutionRuntimeEndpoint must not contain: ${key}`);
  }

  // Check Endpoint Policies
  const models = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getEndpointModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(EndpointExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_ENDPOINT_CREATE), 'Must include NO_ENDPOINT_CREATE policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_ENDPOINT_RESOLVE), 'Must include NO_ENDPOINT_RESOLVE policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_ENDPOINT_REGISTER), 'Must include NO_ENDPOINT_REGISTER policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_ADDRESS_LOOKUP), 'Must include NO_ADDRESS_LOOKUP policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_PORT_BIND), 'Must include NO_PORT_BIND policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_CONNECT), 'Must include NO_CONNECT policy');
    assert(policies.includes(EndpointExecutionPolicy.NO_DISCOVER), 'Must include NO_DISCOVER policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedEndpointPolicies), 'supportedEndpointPolicies must be frozen');
    assert(Object.isFrozen(model.supportedAddressPolicies), 'supportedAddressPolicies must be frozen');
    assert(Object.isFrozen(model.supportedResolutionPolicies), 'supportedResolutionPolicies must be frozen');
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
function testEndpointDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const b1 = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getExecutionRuntimeEndpoint();
  const b2 = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getExecutionRuntimeEndpoint();
  assert(b1 === b2, 'getExecutionRuntimeEndpoint must return identical references');

  const c1 = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const endpoint = DevelopmentRules.getExecutionRuntimeEndpoint(rule);
  
  assert(endpoint !== undefined, 'getExecutionRuntimeEndpoint must resolve properly');
  assert(endpoint === EXECUTION_RUNTIME_ENDPOINT_BLUEPRINT.getExecutionRuntimeEndpoint(), 'Resolved endpoint must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeEndpoint.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreateEndpoint\s*\(/, name: 'createEndpoint()' },
    { pattern: /\bgenerateEndpoint\s*\(/, name: 'generateEndpoint()' },
    { pattern: /\bresolveEndpoint\s*\(/, name: 'resolveEndpoint()' },
    { pattern: /\bregisterEndpoint\s*\(/, name: 'registerEndpoint()' },
    { pattern: /\bopenEndpoint\s*\(/, name: 'openEndpoint()' },
    { pattern: /\bcloseEndpoint\s*\(/, name: 'closeEndpoint()' },
    { pattern: /\bbindEndpoint\s*\(/, name: 'bindEndpoint()' },
    { pattern: /\blookupEndpoint\s*\(/, name: 'lookupEndpoint()' },
    { pattern: /\bdiscoverEndpoint\s*\(/, name: 'discoverEndpoint()' },
    { pattern: /\bconnectEndpoint\s*\(/, name: 'connectEndpoint()' },
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
    { pattern: /\bDNS\b/, name: 'DNS' },
    { pattern: /\bResolver\b/, name: 'Resolver' },
    { pattern: /\bAddress\b/, name: 'Address' },
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
testEndpointStructureAndImmutability();
testEndpointContextIdOnly();
testEndpointRuntimeLogicSeparation();
testEndpointDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME ENDPOINT TESTS PASSED');
console.log('======================================\n');
