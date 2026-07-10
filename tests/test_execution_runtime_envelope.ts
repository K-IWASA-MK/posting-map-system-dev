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
import { EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT, EnvelopeType, EnvelopeScope, RuntimeEnvelopeType, EnvelopeLifecycleState, EnvelopeCapability, EnvelopeCategory, EnvelopeHeaderPolicy, EnvelopePayloadPolicy, EnvelopeFormatPolicy, EnvelopeValidationPolicy, EnvelopeExecutionPolicy, EnvelopeDependencyPolicy, EnvelopeTopology, RUNTIME_ENVELOPE_MODELS, ENVELOPE_SEQUENCE } from '../src/execution/ExecutionRuntimeEnvelope';
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
function testEnvelopeStructureAndImmutability() {
  console.log('[Test 1] Envelope structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT), 'EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT container must be frozen');
  
  const envelope = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getExecutionRuntimeEnvelope();
  assert(Object.isFrozen(envelope), 'Envelope must be frozen');
  assert(Object.isFrozen(envelope.metadata), 'Envelope Metadata must be frozen');
  assert(Object.isFrozen(envelope.context), 'Envelope Context must be frozen');
  assert(Object.isFrozen(envelope.data), 'Envelope Data must be frozen');
  assert(Object.isFrozen(envelope.data.envelopeModels), 'Envelope Models array must be frozen');
  assert(Object.isFrozen(ENVELOPE_SEQUENCE), 'ENVELOPE_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_ENVELOPE_MODELS), 'RUNTIME_ENVELOPE_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-envelope-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Envelope Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Envelope Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testEnvelopeContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getContext();
  assert(context.runtimeEnvelopeId === 'runtime-envelope-01', 'Context must have runtimeEnvelopeId');
  
  // Verify that context does NOT contain any direct references or buffers/payloads/headers
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeEnvelopeId', 'Context must contain only runtimeEnvelopeId');
  
  const forbiddenContextKeys = ['envelopeRef', 'messageRef', 'frameRef', 'packetRef', 'payload', 'header', 'body', 'buffer', 'checksum', 'stream'];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testEnvelopeRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT;
  const envelope: any = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getExecutionRuntimeEnvelope();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createEnvelope', 'buildEnvelope', 'parseEnvelope', 'wrapEnvelope', 'unwrapEnvelope', 'sendEnvelope', 'receiveEnvelope',
    'validateEnvelope', 'signEnvelope', 'verifyEnvelope', 'encryptEnvelope', 'decryptEnvelope', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT must not contain: ${key}`);
    assert(envelope[key] === undefined, `ExecutionRuntimeEnvelope must not contain: ${key}`);
  }

  // Check Envelope Policies
  const models = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getEnvelopeModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(EnvelopeExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_CONNECTION), 'Must include NO_CONNECTION policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_PROTOCOL), 'Must include NO_PROTOCOL policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_SESSION), 'Must include NO_SESSION policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_PACKET), 'Must include NO_PACKET policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_FRAME), 'Must include NO_FRAME policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_MESSAGE), 'Must include NO_MESSAGE policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_ENVELOPE_BUILD), 'Must include NO_ENVELOPE_BUILD policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_ENVELOPE_PARSE), 'Must include NO_ENVELOPE_PARSE policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_ENVELOPE_SEND), 'Must include NO_ENVELOPE_SEND policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_ENVELOPE_RECEIVE), 'Must include NO_ENVELOPE_RECEIVE policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_SIGN), 'Must include NO_SIGN policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_VERIFY), 'Must include NO_VERIFY policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_ENCRYPT), 'Must include NO_ENCRYPT policy');
    assert(policies.includes(EnvelopeExecutionPolicy.NO_DECRYPT), 'Must include NO_DECRYPT policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedEnvelopePolicies), 'supportedEnvelopePolicies must be frozen');
    assert(Object.isFrozen(model.supportedFormatPolicies), 'supportedFormatPolicies must be frozen');
    assert(Object.isFrozen(model.supportedValidationPolicies), 'supportedValidationPolicies must be frozen');
    assert(Object.isFrozen(model.lifecycleStates), 'lifecycleStates must be frozen');
    assert(Object.isFrozen(model.executionPolicies), 'executionPolicies must be frozen');
    assert(Object.isFrozen(model.allowedSteps), 'allowedSteps must be frozen');
    assert(Object.isFrozen(model.supportedConnectionPolicies), 'supportedConnectionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedTransportPolicies), 'supportedTransportPolicies must be frozen');
    assert(Object.isFrozen(model.supportedProtocolPolicies), 'supportedProtocolPolicies must be frozen');
    assert(Object.isFrozen(model.supportedSessionPolicies), 'supportedSessionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedPacketPolicies), 'supportedPacketPolicies must be frozen');
    assert(Object.isFrozen(model.supportedFramePolicies), 'supportedFramePolicies must be frozen');
    assert(Object.isFrozen(model.supportedMessagePolicies), 'supportedMessagePolicies must be frozen');
    assert(Object.isFrozen(model.supportedHeaderPolicies), 'supportedHeaderPolicies must be frozen');
    assert(Object.isFrozen(model.supportedPayloadPolicies), 'supportedPayloadPolicies must be frozen');
    assert(Object.isFrozen(model.metadata), 'model metadata must be frozen');
    assert(Object.isFrozen(model), 'model must be frozen');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testEnvelopeDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const e1 = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getExecutionRuntimeEnvelope();
  const e2 = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getExecutionRuntimeEnvelope();
  assert(e1 === e2, 'getExecutionRuntimeEnvelope must return identical references');

  const c1 = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const envelope = DevelopmentRules.getExecutionRuntimeEnvelope(rule);
  
  assert(envelope !== undefined, 'getExecutionRuntimeEnvelope must resolve properly');
  assert(envelope === EXECUTION_RUNTIME_ENVELOPE_BLUEPRINT.getExecutionRuntimeEnvelope(), 'Resolved envelope must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeEnvelope.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreateEnvelope\s*\(/, name: 'createEnvelope()' },
    { pattern: /\bbuildEnvelope\s*\(/, name: 'buildEnvelope()' },
    { pattern: /\bparseEnvelope\s*\(/, name: 'parseEnvelope()' },
    { pattern: /\bwrapEnvelope\s*\(/, name: 'wrapEnvelope()' },
    { pattern: /\bunwrapEnvelope\s*\(/, name: 'unwrapEnvelope()' },
    { pattern: /\bsendEnvelope\s*\(/, name: 'sendEnvelope()' },
    { pattern: /\breceiveEnvelope\s*\(/, name: 'receiveEnvelope()' },
    { pattern: /\bvalidateEnvelope\s*\(/, name: 'validateEnvelope()' },
    { pattern: /\bsignEnvelope\s*\(/, name: 'signEnvelope()' },
    { pattern: /\bverifyEnvelope\s*\(/, name: 'verifyEnvelope()' },
    { pattern: /\bencryptEnvelope\s*\(/, name: 'encryptEnvelope()' },
    { pattern: /\bdecryptEnvelope\s*\(/, name: 'decryptEnvelope()' },
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
testEnvelopeStructureAndImmutability();
testEnvelopeContextIdOnly();
testEnvelopeRuntimeLogicSeparation();
testEnvelopeDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME ENVELOPE TESTS PASSED');
console.log('======================================\n');
