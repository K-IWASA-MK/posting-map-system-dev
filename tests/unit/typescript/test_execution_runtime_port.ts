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
import { EXECUTION_RUNTIME_PORT_BLUEPRINT, PortType, PortScope, RuntimePortType, PortLifecycleState, PortCapability, PortCategory, PortDirectionPolicy, PortValidationPolicy, PortExecutionPolicy, PortDependencyPolicy, PortTopology, RUNTIME_PORT_MODELS, PORT_SEQUENCE } from '../../../src/execution/ExecutionRuntimePort';
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
function testPortStructureAndImmutability() {
  console.log('[Test 1] Port structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_PORT_BLUEPRINT), 'EXECUTION_RUNTIME_PORT_BLUEPRINT container must be frozen');
  
  const port = EXECUTION_RUNTIME_PORT_BLUEPRINT.getExecutionRuntimePort();
  assert(Object.isFrozen(port), 'Port must be frozen');
  assert(Object.isFrozen(port.metadata), 'Port Metadata must be frozen');
  assert(Object.isFrozen(port.context), 'Port Context must be frozen');
  assert(Object.isFrozen(port.data), 'Port Data must be frozen');
  assert(Object.isFrozen(port.data.portModels), 'Port Models array must be frozen');
  assert(Object.isFrozen(PORT_SEQUENCE), 'PORT_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_PORT_MODELS), 'RUNTIME_PORT_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_PORT_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-port-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'ExecutionRuntimePortMetadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'PortLayer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testPortContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_PORT_BLUEPRINT.getContext();
  assert(context.runtimePortId === 'runtime-port-01', 'Context must have runtimePortId');
  
  // Verify that context does NOT contain any direct references or buffers/queues/channels
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimePortId', 'Context must contain only runtimePortId');
  
  const forbiddenContextKeys = [
    'portRef', 'endpointRef', 'connectionRef', 'socketRef', 'streamRef', 'queue', 'buffer', 'address', 'number', 'channel', 'pointer', 'checksum'
  ];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testPortRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_PORT_BLUEPRINT;
  const port: any = EXECUTION_RUNTIME_PORT_BLUEPRINT.getExecutionRuntimePort();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createPort', 'generatePort', 'openPort', 'closePort', 'bindPort', 'unbindPort', 'connectPort', 'disconnectPort', 'listenPort', 'sendPort', 'receivePort', 'routePort', 'queuePort',
    'fd', 'descriptor', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_PORT_BLUEPRINT must not contain: ${key}`);
    assert(port[key] === undefined, `ExecutionRuntimePort must not contain: ${key}`);
  }

  // Check Port Policies
  const models = EXECUTION_RUNTIME_PORT_BLUEPRINT.getPortModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(PortExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(PortExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(PortExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(PortExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(PortExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(PortExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(PortExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(PortExecutionPolicy.NO_PORT_CREATE), 'Must include NO_PORT_CREATE policy');
    assert(policies.includes(PortExecutionPolicy.NO_PORT_RESOLVE), 'Must include NO_PORT_RESOLVE policy');
    assert(policies.includes(PortExecutionPolicy.NO_PORT_REGISTER), 'Must include NO_PORT_REGISTER policy');
    assert(policies.includes(PortExecutionPolicy.NO_PORT_OPEN), 'Must include NO_PORT_OPEN policy');
    assert(policies.includes(PortExecutionPolicy.NO_PORT_CLOSE), 'Must include NO_PORT_CLOSE policy');
    assert(policies.includes(PortExecutionPolicy.NO_PORT_BIND), 'Must include NO_PORT_BIND policy');
    assert(policies.includes(PortExecutionPolicy.NO_PORT_UNBIND), 'Must include NO_PORT_UNBIND policy');
    assert(policies.includes(PortExecutionPolicy.NO_CONNECT), 'Must include NO_CONNECT policy');
    assert(policies.includes(PortExecutionPolicy.NO_DISCONNECT), 'Must include NO_DISCONNECT policy');
    assert(policies.includes(PortExecutionPolicy.NO_LISTEN), 'Must include NO_LISTEN policy');
    assert(policies.includes(PortExecutionPolicy.NO_SEND), 'Must include NO_SEND policy');
    assert(policies.includes(PortExecutionPolicy.NO_RECEIVE), 'Must include NO_RECEIVE policy');
    assert(policies.includes(PortExecutionPolicy.NO_ROUTE), 'Must include NO_ROUTE policy');
    assert(policies.includes(PortExecutionPolicy.NO_QUEUE_PROCESS), 'Must include NO_QUEUE_PROCESS policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedPortPolicies), 'supportedPortPolicies must be frozen');
    assert(Object.isFrozen(model.supportedDirectionPolicies), 'supportedDirectionPolicies must be frozen');
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
function testPortDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const b1 = EXECUTION_RUNTIME_PORT_BLUEPRINT.getExecutionRuntimePort();
  const b2 = EXECUTION_RUNTIME_PORT_BLUEPRINT.getExecutionRuntimePort();
  assert(b1 === b2, 'getExecutionRuntimePort must return identical references');

  const c1 = EXECUTION_RUNTIME_PORT_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_PORT_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_PORT_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_PORT_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const port = DevelopmentRules.getExecutionRuntimePort(rule);
  
  assert(port !== undefined, 'getExecutionRuntimePort must resolve properly');
  assert(port === EXECUTION_RUNTIME_PORT_BLUEPRINT.getExecutionRuntimePort(), 'Resolved port must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimePort.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreatePort\s*\(/, name: 'createPort()' },
    { pattern: /\bgeneratePort\s*\(/, name: 'generatePort()' },
    { pattern: /\bopenPort\s*\(/, name: 'openPort()' },
    { pattern: /\bclosePort\s*\(/, name: 'closePort()' },
    { pattern: /\bbindPort\s*\(/, name: 'bindPort()' },
    { pattern: /\bunbindPort\s*\(/, name: 'unbindPort()' },
    { pattern: /\bconnectPort\s*\(/, name: 'connectPort()' },
    { pattern: /\bdisconnectPort\s*\(/, name: 'disconnectPort()' },
    { pattern: /\blistenPort\s*\(/, name: 'listenPort()' },
    { pattern: /\bsendPort\s*\(/, name: 'sendPort()' },
    { pattern: /\breceivePort\s*\(/, name: 'receivePort()' },
    { pattern: /\broutePort\s*\(/, name: 'routePort()' },
    { pattern: /\bqueuePort\s*\(/, name: 'queuePort()' },
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
    { pattern: /\bWorker\b/, name: 'Worker' },
    { pattern: /\bThread\b/, name: 'Thread' },
    { pattern: /\bQueue\b/, name: 'Queue' },
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
testPortStructureAndImmutability();
testPortContextIdOnly();
testPortRuntimeLogicSeparation();
testPortDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME PORT TESTS PASSED');
console.log('======================================\n');
