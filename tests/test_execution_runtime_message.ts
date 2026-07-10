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
import { EXECUTION_RUNTIME_MESSAGE_BLUEPRINT, MessageType, MessageScope, RuntimeMessageType, MessageLifecycleState, MessageCapability, MessageCategory, MessageDirectionPolicy, MessageFormatPolicy, MessageValidationPolicy, MessageExecutionPolicy, MessageDependencyPolicy, MessageTopology, MessagePriorityPolicy, MessageDeliveryPolicy, MessageReliabilityPolicy, RUNTIME_MESSAGE_MODELS, MESSAGE_SEQUENCE } from '../src/execution/ExecutionRuntimeMessage';
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
function testMessageStructureAndImmutability() {
  console.log('[Test 1] Message structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_MESSAGE_BLUEPRINT), 'EXECUTION_RUNTIME_MESSAGE_BLUEPRINT container must be frozen');
  
  const message = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getExecutionRuntimeMessage();
  assert(Object.isFrozen(message), 'Message must be frozen');
  assert(Object.isFrozen(message.metadata), 'Message Metadata must be frozen');
  assert(Object.isFrozen(message.context), 'Message Context must be frozen');
  assert(Object.isFrozen(message.data), 'Message Data must be frozen');
  assert(Object.isFrozen(message.data.messageModels), 'Message Models array must be frozen');
  assert(Object.isFrozen(MESSAGE_SEQUENCE), 'MESSAGE_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_MESSAGE_MODELS), 'RUNTIME_MESSAGE_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-message-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Message Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Message Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testMessageContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getContext();
  assert(context.runtimeMessageId === 'runtime-message-01', 'Context must have runtimeMessageId');
  
  // Verify that context does NOT contain any direct references or buffers/payloads/headers
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeMessageId', 'Context must contain only runtimeMessageId');
  
  const forbiddenContextKeys = ['messageRef', 'frameRef', 'packetRef', 'payload', 'header', 'body', 'buffer', 'checksum', 'stream'];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testMessageRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT;
  const message: any = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getExecutionRuntimeMessage();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createMessage', 'buildMessage', 'parseMessage', 'sendMessage', 'receiveMessage', 'replyMessage', 'forwardMessage', 'routeMessage', 'dispatchMessage',
    'broadcastMessage', 'multicastMessage', 'acknowledgeMessage', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_MESSAGE_BLUEPRINT must not contain: ${key}`);
    assert(message[key] === undefined, `ExecutionRuntimeMessage must not contain: ${key}`);
  }

  // Check Message Policies
  const models = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getMessageModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(MessageExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(MessageExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(MessageExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(MessageExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(MessageExecutionPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(MessageExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(MessageExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(MessageExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(MessageExecutionPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(MessageExecutionPolicy.NO_CONNECTION), 'Must include NO_CONNECTION policy');
    assert(policies.includes(MessageExecutionPolicy.NO_PROTOCOL), 'Must include NO_PROTOCOL policy');
    assert(policies.includes(MessageExecutionPolicy.NO_SESSION), 'Must include NO_SESSION policy');
    assert(policies.includes(MessageExecutionPolicy.NO_PACKET), 'Must include NO_PACKET policy');
    assert(policies.includes(MessageExecutionPolicy.NO_FRAME), 'Must include NO_FRAME policy');
    assert(policies.includes(MessageExecutionPolicy.NO_MESSAGE_BUILD), 'Must include NO_MESSAGE_BUILD policy');
    assert(policies.includes(MessageExecutionPolicy.NO_MESSAGE_PARSE), 'Must include NO_MESSAGE_PARSE policy');
    assert(policies.includes(MessageExecutionPolicy.NO_MESSAGE_SEND), 'Must include NO_MESSAGE_SEND policy');
    assert(policies.includes(MessageExecutionPolicy.NO_MESSAGE_RECEIVE), 'Must include NO_MESSAGE_RECEIVE policy');
    assert(policies.includes(MessageExecutionPolicy.NO_REPLY), 'Must include NO_REPLY policy');
    assert(policies.includes(MessageExecutionPolicy.NO_FORWARD), 'Must include NO_FORWARD policy');
    assert(policies.includes(MessageExecutionPolicy.NO_ROUTE), 'Must include NO_ROUTE policy');
    assert(policies.includes(MessageExecutionPolicy.NO_DISPATCH), 'Must include NO_DISPATCH policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedMessagePolicies), 'supportedMessagePolicies must be frozen');
    assert(Object.isFrozen(model.supportedFormatPolicies), 'supportedFormatPolicies must be frozen');
    assert(Object.isFrozen(model.supportedValidationPolicies), 'supportedValidationPolicies must be frozen');
    assert(Object.isFrozen(model.supportedDirectionPolicies), 'supportedDirectionPolicies must be frozen');
    assert(Object.isFrozen(model.lifecycleStates), 'lifecycleStates must be frozen');
    assert(Object.isFrozen(model.executionPolicies), 'executionPolicies must be frozen');
    assert(Object.isFrozen(model.allowedSteps), 'allowedSteps must be frozen');
    assert(Object.isFrozen(model.supportedConnectionPolicies), 'supportedConnectionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedTransportPolicies), 'supportedTransportPolicies must be frozen');
    assert(Object.isFrozen(model.supportedProtocolPolicies), 'supportedProtocolPolicies must be frozen');
    assert(Object.isFrozen(model.supportedSessionPolicies), 'supportedSessionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedPacketPolicies), 'supportedPacketPolicies must be frozen');
    assert(Object.isFrozen(model.supportedFramePolicies), 'supportedFramePolicies must be frozen');
    assert(Object.isFrozen(model.supportedPriorityPolicies), 'supportedPriorityPolicies must be frozen');
    assert(Object.isFrozen(model.supportedDeliveryPolicies), 'supportedDeliveryPolicies must be frozen');
    assert(Object.isFrozen(model.supportedReliabilityPolicies), 'supportedReliabilityPolicies must be frozen');
    assert(Object.isFrozen(model.metadata), 'model metadata must be frozen');
    assert(Object.isFrozen(model), 'model must be frozen');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testMessageDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getExecutionRuntimeMessage();
  const m2 = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getExecutionRuntimeMessage();
  assert(m1 === m2, 'getExecutionRuntimeMessage must return identical references');

  const c1 = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const message = DevelopmentRules.getExecutionRuntimeMessage(rule);
  
  assert(message !== undefined, 'getExecutionRuntimeMessage must resolve properly');
  assert(message === EXECUTION_RUNTIME_MESSAGE_BLUEPRINT.getExecutionRuntimeMessage(), 'Resolved message must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeMessage.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreateMessage\s*\(/, name: 'createMessage()' },
    { pattern: /\bbuildMessage\s*\(/, name: 'buildMessage()' },
    { pattern: /\bparseMessage\s*\(/, name: 'parseMessage()' },
    { pattern: /\bsendMessage\s*\(/, name: 'sendMessage()' },
    { pattern: /\breceiveMessage\s*\(/, name: 'receiveMessage()' },
    { pattern: /\breplyMessage\s*\(/, name: 'replyMessage()' },
    { pattern: /\bforwardMessage\s*\(/, name: 'forwardMessage()' },
    { pattern: /\brouteMessage\s*\(/, name: 'routeMessage()' },
    { pattern: /\bdispatchMessage\s*\(/, name: 'dispatchMessage()' },
    { pattern: /\bbroadcastMessage\s*\(/, name: 'broadcastMessage()' },
    { pattern: /\bmulticastMessage\s*\(/, name: 'multicastMessage()' },
    { pattern: /\backnowledgeMessage\s*\(/, name: 'acknowledgeMessage()' },
    { pattern: /\bPromise\b/, name: 'Promise' },
    { pattern: /\basync\b/, name: 'async' },
    { pattern: /\bawait\b/, name: 'await' },
    { pattern: /\bsetTimeout\b/, name: 'setTimeout' },
    { pattern: /\bsetInterval\b/, name: 'setInterval' },
    { pattern: /\bTimer\b/, name: 'Timer' },
    { pattern: /\bEventEmitter\b/, name: 'EventEmitter' },
    { pattern: /\bBuffer\b/, name: 'Buffer' },
    { pattern: /\bReadable\b/, name: 'Readable' },
    { pattern: /\bWritable\b/, name: 'Writable' },
    { pattern: /\bDuplex\b/, name: 'Duplex' },
    { pattern: /\bTransform\b/, name: 'Transform' },
    { pattern: /\bSocket\b/, name: 'Socket' },
    { pattern: /\bStream\b/, name: 'Stream' },
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
testMessageStructureAndImmutability();
testMessageContextIdOnly();
testMessageRuntimeLogicSeparation();
testMessageDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME MESSAGE TESTS PASSED');
console.log('======================================\n');
