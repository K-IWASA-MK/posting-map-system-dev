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
import { EXECUTION_RUNTIME_BUFFER_BLUEPRINT, BufferType, BufferScope, RuntimeBufferType, BufferLifecycleState, BufferCapability, BufferCategory, BufferValidationPolicy, BufferAllocationPolicy, BufferExecutionPolicy, BufferDependencyPolicy, BufferTopology, RUNTIME_BUFFER_MODELS, BUFFER_SEQUENCE } from '../../../src/execution/ExecutionRuntimeBuffer';
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
function testBufferStructureAndImmutability() {
  console.log('[Test 1] Buffer structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_BUFFER_BLUEPRINT), 'EXECUTION_RUNTIME_BUFFER_BLUEPRINT container must be frozen');
  
  const buffer = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getExecutionRuntimeBuffer();
  assert(Object.isFrozen(buffer), 'Buffer must be frozen');
  assert(Object.isFrozen(buffer.metadata), 'Buffer Metadata must be frozen');
  assert(Object.isFrozen(buffer.context), 'Buffer Context must be frozen');
  assert(Object.isFrozen(buffer.data), 'Buffer Data must be frozen');
  assert(Object.isFrozen(buffer.data.bufferModels), 'Buffer Models array must be frozen');
  assert(Object.isFrozen(BUFFER_SEQUENCE), 'BUFFER_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_BUFFER_MODELS), 'RUNTIME_BUFFER_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-buffer-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'ExecutionRuntimeBufferMetadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'BufferLayer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testBufferContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getContext();
  assert(context.runtimeBufferId === 'runtime-buffer-01', 'Context must have runtimeBufferId');
  
  // Verify that context does NOT contain any direct references or buffers/memory
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeBufferId', 'Context must contain only runtimeBufferId');
  
  const forbiddenContextKeys = ['bufferRef', 'memoryRef', 'streamRef', 'socketRef', 'pointer', 'address', 'connectionRef', 'checksum'];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testBufferRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_BUFFER_BLUEPRINT;
  const buffer: any = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getExecutionRuntimeBuffer();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'allocate', 'allocateUnsafe', 'free', 'read', 'write', 'copy', 'slice', 'concat', 'fill', 'resize', 'clear',
    'fd', 'descriptor', 'payload', 'header', 'body', 'checksum', 'buffer', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_BUFFER_BLUEPRINT must not contain: ${key}`);
    assert(buffer[key] === undefined, `ExecutionRuntimeBuffer must not contain: ${key}`);
  }

  // Check Buffer Policies
  const models = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getBufferModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(BufferExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(BufferExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(BufferExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(BufferExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(BufferExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(BufferExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(BufferExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(BufferExecutionPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(BufferExecutionPolicy.NO_CONNECTION), 'Must include NO_CONNECTION policy');
    assert(policies.includes(BufferExecutionPolicy.NO_PROTOCOL), 'Must include NO_PROTOCOL policy');
    assert(policies.includes(BufferExecutionPolicy.NO_SESSION), 'Must include NO_SESSION policy');
    assert(policies.includes(BufferExecutionPolicy.NO_SOCKET), 'Must include NO_SOCKET policy');
    assert(policies.includes(BufferExecutionPolicy.NO_STREAM), 'Must include NO_STREAM policy');
    assert(policies.includes(BufferExecutionPolicy.NO_BUFFER_CREATE), 'Must include NO_BUFFER_CREATE policy');
    assert(policies.includes(BufferExecutionPolicy.NO_BUFFER_ALLOCATE), 'Must include NO_BUFFER_ALLOCATE policy');
    assert(policies.includes(BufferExecutionPolicy.NO_BUFFER_READ), 'Must include NO_BUFFER_READ policy');
    assert(policies.includes(BufferExecutionPolicy.NO_BUFFER_WRITE), 'Must include NO_BUFFER_WRITE policy');
    assert(policies.includes(BufferExecutionPolicy.NO_BUFFER_COPY), 'Must include NO_BUFFER_COPY policy');
    assert(policies.includes(BufferExecutionPolicy.NO_BUFFER_SLICE), 'Must include NO_BUFFER_SLICE policy');
    assert(policies.includes(BufferExecutionPolicy.NO_MEMORY_ACCESS), 'Must include NO_MEMORY_ACCESS policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedBufferPolicies), 'supportedBufferPolicies must be frozen');
    assert(Object.isFrozen(model.supportedValidationPolicies), 'supportedValidationPolicies must be frozen');
    assert(Object.isFrozen(model.supportedAllocationPolicies), 'supportedAllocationPolicies must be frozen');
    assert(Object.isFrozen(model.lifecycleStates), 'lifecycleStates must be frozen');
    assert(Object.isFrozen(model.executionPolicies), 'executionPolicies must be frozen');
    assert(Object.isFrozen(model.allowedSteps), 'allowedSteps must be frozen');
    assert(Object.isFrozen(model.supportedIdentityPolicies), 'supportedIdentityPolicies must be frozen');
    assert(Object.isFrozen(model.supportedSecureChannelPolicies), 'supportedSecureChannelPolicies must be frozen');
    assert(Object.isFrozen(model.supportedConnectionPolicies), 'supportedConnectionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedSocketPolicies), 'supportedSocketPolicies must be frozen');
    assert(Object.isFrozen(model.supportedStreamPolicies), 'supportedStreamPolicies must be frozen');
    assert(Object.isFrozen(model.metadata), 'model metadata must be frozen');
    assert(Object.isFrozen(model), 'model must be frozen');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testBufferDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const b1 = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getExecutionRuntimeBuffer();
  const b2 = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getExecutionRuntimeBuffer();
  assert(b1 === b2, 'getExecutionRuntimeBuffer must return identical references');

  const c1 = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const buffer = DevelopmentRules.getExecutionRuntimeBuffer(rule);
  
  assert(buffer !== undefined, 'getExecutionRuntimeBuffer must resolve properly');
  assert(buffer === EXECUTION_RUNTIME_BUFFER_BLUEPRINT.getExecutionRuntimeBuffer(), 'Resolved buffer must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeBuffer.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\ballocate\s*\(/, name: 'allocate()' },
    { pattern: /\ballocateUnsafe\s*\(/, name: 'allocateUnsafe()' },
    { pattern: /\bfree\s*\(/, name: 'free()' },
    { pattern: /\bread\s*\(/, name: 'read()' },
    { pattern: /\bwrite\s*\(/, name: 'write()' },
    { pattern: /\bcopy\s*\(/, name: 'copy()' },
    { pattern: /\bslice\s*\(/, name: 'slice()' },
    { pattern: /\bconcat\s*\(/, name: 'concat()' },
    { pattern: /\bfill\s*\(/, name: 'fill()' },
    { pattern: /\bresize\s*\(/, name: 'resize()' },
    { pattern: /\bclear\s*\(/, name: 'clear()' },
    { pattern: /\bBuffer\b/, name: 'Buffer' },
    { pattern: /\bArrayBuffer\b/, name: 'ArrayBuffer' },
    { pattern: /\bSharedArrayBuffer\b/, name: 'SharedArrayBuffer' },
    { pattern: /\bTypedArray\b/, name: 'TypedArray' },
    { pattern: /\bDataView\b/, name: 'DataView' },
    { pattern: /\bPromise\b/, name: 'Promise' },
    { pattern: /\basync\b/, name: 'async' },
    { pattern: /\bawait\b/, name: 'await' },
    { pattern: /\bsetTimeout\b/, name: 'setTimeout' },
    { pattern: /\bsetInterval\b/, name: 'setInterval' },
    { pattern: /\bTimer\b/, name: 'Timer' },
    { pattern: /\bEventEmitter\b/, name: 'EventEmitter' },
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
testBufferStructureAndImmutability();
testBufferContextIdOnly();
testBufferRuntimeLogicSeparation();
testBufferDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME BUFFER TESTS PASSED');
console.log('======================================\n');
