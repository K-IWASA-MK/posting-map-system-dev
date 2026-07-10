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
import { EXECUTION_RUNTIME_FRAME_BLUEPRINT, FrameType, FrameScope, RuntimeFrameType, FrameLifecycleState, FrameCapability, FrameCategory, FrameFormatPolicy, FrameValidationPolicy, FrameExecutionPolicy, FrameDependencyPolicy, FrameTopology, RUNTIME_FRAME_MODELS, FRAME_SEQUENCE } from '../src/execution/ExecutionRuntimeFrame';
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
function testFrameStructureAndImmutability() {
  console.log('[Test 1] Frame structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_FRAME_BLUEPRINT), 'EXECUTION_RUNTIME_FRAME_BLUEPRINT container must be frozen');
  
  const frame = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getExecutionRuntimeFrame();
  assert(Object.isFrozen(frame), 'Frame must be frozen');
  assert(Object.isFrozen(frame.metadata), 'Frame Metadata must be frozen');
  assert(Object.isFrozen(frame.context), 'Frame Context must be frozen');
  assert(Object.isFrozen(frame.data), 'Frame Data must be frozen');
  assert(Object.isFrozen(frame.data.frameModels), 'Frame Models array must be frozen');
  assert(Object.isFrozen(FRAME_SEQUENCE), 'FRAME_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_FRAME_MODELS), 'RUNTIME_FRAME_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-frame-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Frame Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Frame Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testFrameContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getContext();
  assert(context.runtimeFrameId === 'runtime-frame-01', 'Context must have runtimeFrameId');
  
  // Verify that context does NOT contain any direct references or buffers/payloads/headers
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeFrameId', 'Context must contain only runtimeFrameId');
  
  const forbiddenContextKeys = ['frameRef', 'packetRef', 'payload', 'header', 'body', 'buffer', 'checksum', 'stream'];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testFrameRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_FRAME_BLUEPRINT;
  const frame: any = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getExecutionRuntimeFrame();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createFrame', 'buildFrame', 'parseFrame', 'encodeFrame', 'decodeFrame', 'fragmentFrame', 'reassembleFrame', 'sendFrame', 'receiveFrame',
    'synchronizeFrame', 'validateFrame', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_FRAME_BLUEPRINT must not contain: ${key}`);
    assert(frame[key] === undefined, `ExecutionRuntimeFrame must not contain: ${key}`);
  }

  // Check Frame Policies
  const models = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getFrameModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(FrameExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(FrameExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(FrameExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(FrameExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(FrameExecutionPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(FrameExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(FrameExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(FrameExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(FrameExecutionPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(FrameExecutionPolicy.NO_CONNECTION), 'Must include NO_CONNECTION policy');
    assert(policies.includes(FrameExecutionPolicy.NO_PROTOCOL), 'Must include NO_PROTOCOL policy');
    assert(policies.includes(FrameExecutionPolicy.NO_SESSION), 'Must include NO_SESSION policy');
    assert(policies.includes(FrameExecutionPolicy.NO_PACKET), 'Must include NO_PACKET policy');
    assert(policies.includes(FrameExecutionPolicy.NO_SOCKET), 'Must include NO_SOCKET policy');
    assert(policies.includes(FrameExecutionPolicy.NO_STREAM), 'Must include NO_STREAM policy');
    assert(policies.includes(FrameExecutionPolicy.NO_FRAME_BUILD), 'Must include NO_FRAME_BUILD policy');
    assert(policies.includes(FrameExecutionPolicy.NO_FRAME_PARSE), 'Must include NO_FRAME_PARSE policy');
    assert(policies.includes(FrameExecutionPolicy.NO_FRAME_SEND), 'Must include NO_FRAME_SEND policy');
    assert(policies.includes(FrameExecutionPolicy.NO_FRAME_RECEIVE), 'Must include NO_FRAME_RECEIVE policy');
    assert(policies.includes(FrameExecutionPolicy.NO_FRAGMENT), 'Must include NO_FRAGMENT policy');
    assert(policies.includes(FrameExecutionPolicy.NO_REASSEMBLY), 'Must include NO_REASSEMBLY policy');
    assert(policies.includes(FrameExecutionPolicy.NO_SYNCHRONIZATION), 'Must include NO_SYNCHRONIZATION policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedFramePolicies), 'supportedFramePolicies must be frozen');
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
    assert(Object.isFrozen(model.metadata), 'model metadata must be frozen');
    assert(Object.isFrozen(model), 'model must be frozen');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testFrameDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const f1 = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getExecutionRuntimeFrame();
  const f2 = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getExecutionRuntimeFrame();
  assert(f1 === f2, 'getExecutionRuntimeFrame must return identical references');

  const c1 = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_FRAME_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const frame = DevelopmentRules.getExecutionRuntimeFrame(rule);
  
  assert(frame !== undefined, 'getExecutionRuntimeFrame must resolve properly');
  assert(frame === EXECUTION_RUNTIME_FRAME_BLUEPRINT.getExecutionRuntimeFrame(), 'Resolved frame must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeFrame.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreateFrame\s*\(/, name: 'createFrame()' },
    { pattern: /\bbuildFrame\s*\(/, name: 'buildFrame()' },
    { pattern: /\bparseFrame\s*\(/, name: 'parseFrame()' },
    { pattern: /\bencodeFrame\s*\(/, name: 'encodeFrame()' },
    { pattern: /\bdecodeFrame\s*\(/, name: 'decodeFrame()' },
    { pattern: /\bfragmentFrame\s*\(/, name: 'fragmentFrame()' },
    { pattern: /\breassembleFrame\s*\(/, name: 'reassembleFrame()' },
    { pattern: /\bsendFrame\s*\(/, name: 'sendFrame()' },
    { pattern: /\breceiveFrame\s*\(/, name: 'receiveFrame()' },
    { pattern: /\bsynchronizeFrame\s*\(/, name: 'synchronizeFrame()' },
    { pattern: /\bvalidateFrame\s*\(/, name: 'validateFrame()' },
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
testFrameStructureAndImmutability();
testFrameContextIdOnly();
testFrameRuntimeLogicSeparation();
testFrameDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME FRAME TESTS PASSED');
console.log('======================================\n');
