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
import { EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT, MessageQueueType, MessageQueueScope, RuntimeMessageQueueType, MessageQueueLifecycleState, MessageQueueCapability, MessageQueueCategory, MessageQueueOrderingPolicy, MessageQueueValidationPolicy, MessageQueueExecutionPolicy, MessageQueueDependencyPolicy, MessageQueueTopology, RUNTIME_MESSAGE_QUEUE_MODELS, MESSAGE_QUEUE_SEQUENCE } from '../../../src/execution/ExecutionRuntimeMessageQueue';
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
function testQueueStructureAndImmutability() {
  console.log('[Test 1] Queue structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT), 'EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT container must be frozen');
  
  const queue = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getExecutionRuntimeMessageQueue();
  assert(Object.isFrozen(queue), 'Queue must be frozen');
  assert(Object.isFrozen(queue.metadata), 'Queue Metadata must be frozen');
  assert(Object.isFrozen(queue.context), 'Queue Context must be frozen');
  assert(Object.isFrozen(queue.data), 'Queue Data must be frozen');
  assert(Object.isFrozen(queue.data.queueModels), 'Queue Models array must be frozen');
  assert(Object.isFrozen(MESSAGE_QUEUE_SEQUENCE), 'MESSAGE_QUEUE_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_MESSAGE_QUEUE_MODELS), 'RUNTIME_MESSAGE_QUEUE_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-queue-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'ExecutionRuntimeQueueMetadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'QueueLayer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testQueueContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getContext();
  assert(context.runtimeMessageQueueId === 'runtime-queue-01', 'Context must have runtimeMessageQueueId');
  
  // Verify that context does NOT contain any direct references or buffers/queues/channels
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeMessageQueueId', 'Context must contain only runtimeMessageQueueId');
  
  const forbiddenContextKeys = [
    'queueRef', 'messageRef', 'portRef', 'channelRef', 'bufferRef', 'streamRef', 'connectionRef', 'items', 'messages', 'state', 'size', 'pointer', 'checksum'
  ];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testQueueRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT;
  const queue: any = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getExecutionRuntimeMessageQueue();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createQueue', 'generateQueue', 'openQueue', 'closeQueue', 'enqueue', 'dequeue', 'push', 'pop', 'peek', 'clearQueue', 'removeQueue', 'processQueue', 'scheduleQueue', 'dispatchQueue', 'consumeQueue', 'produceQueue',
    'fd', 'descriptor', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT must not contain: ${key}`);
    assert(queue[key] === undefined, `ExecutionRuntimeMessageQueue must not contain: ${key}`);
  }

  // Check Queue Policies
  const models = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getQueueModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(MessageQueueExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_CREATE), 'Must include NO_QUEUE_CREATE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_RESOLVE), 'Must include NO_QUEUE_RESOLVE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_REGISTER), 'Must include NO_QUEUE_REGISTER policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_OPEN), 'Must include NO_QUEUE_OPEN policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_CLOSE), 'Must include NO_QUEUE_CLOSE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_ENQUEUE), 'Must include NO_ENQUEUE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_DEQUEUE), 'Must include NO_DEQUEUE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_PUSH), 'Must include NO_PUSH policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_POP), 'Must include NO_POP policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_PEEK), 'Must include NO_PEEK policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_CLEAR), 'Must include NO_QUEUE_CLEAR policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_REMOVE), 'Must include NO_QUEUE_REMOVE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_PROCESS), 'Must include NO_QUEUE_PROCESS policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_SCHEDULE), 'Must include NO_QUEUE_SCHEDULE policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_DISPATCH), 'Must include NO_QUEUE_DISPATCH policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_CONSUME), 'Must include NO_QUEUE_CONSUME policy');
    assert(policies.includes(MessageQueueExecutionPolicy.NO_QUEUE_PRODUCE), 'Must include NO_QUEUE_PRODUCE policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedQueuePolicies), 'supportedQueuePolicies must be frozen');
    assert(Object.isFrozen(model.supportedOrderingPolicies), 'supportedOrderingPolicies must be frozen');
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
function testQueueDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const b1 = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getExecutionRuntimeMessageQueue();
  const b2 = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getExecutionRuntimeMessageQueue();
  assert(b1 === b2, 'getExecutionRuntimeMessageQueue must return identical references');

  const c1 = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const queue = DevelopmentRules.getExecutionRuntimeMessageQueue(rule);
  
  assert(queue !== undefined, 'getExecutionRuntimeMessageQueue must resolve properly');
  assert(queue === EXECUTION_RUNTIME_MESSAGE_QUEUE_BLUEPRINT.getExecutionRuntimeMessageQueue(), 'Resolved queue must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeMessageQueue.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreateQueue\s*\(/, name: 'createQueue()' },
    { pattern: /\bgenerateQueue\s*\(/, name: 'generateQueue()' },
    { pattern: /\bopenQueue\s*\(/, name: 'openQueue()' },
    { pattern: /\bcloseQueue\s*\(/, name: 'closeQueue()' },
    { pattern: /\benqueue\s*\(/, name: 'enqueue()' },
    { pattern: /\bdequeue\s*\(/, name: 'dequeue()' },
    { pattern: /\bpush\s*\(/, name: 'push()' },
    { pattern: /\bpop\s*\(/, name: 'pop()' },
    { pattern: /\bpeek\s*\(/, name: 'peek()' },
    { pattern: /\bclearQueue\s*\(/, name: 'clearQueue()' },
    { pattern: /\bremoteQueue\s*\(/, name: 'remoteQueue()' },
    { pattern: /\bprocessQueue\s*\(/, name: 'processQueue()' },
    { pattern: /\bscheduleQueue\s*\(/, name: 'scheduleQueue()' },
    { pattern: /\bdispatchQueue\s*\(/, name: 'dispatchQueue()' },
    { pattern: /\bconsumeQueue\s*\(/, name: 'consumeQueue()' },
    { pattern: /\bproduceQueue\s*\(/, name: 'produceQueue()' },
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
    { pattern: /\bWorker\b/, name: 'Worker' },
    { pattern: /\bThread\b/, name: 'Thread' },
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
testQueueStructureAndImmutability();
testQueueContextIdOnly();
testQueueRuntimeLogicSeparation();
testQueueDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME QUEUE TESTS PASSED');
console.log('======================================\n');
