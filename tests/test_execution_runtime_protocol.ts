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
import { EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT, ProtocolType, ProtocolScope, RuntimeProtocolType, ProtocolLifecycleState, ProtocolCapability, ProtocolCategory, ProtocolVersionPolicy, ProtocolSerializationPolicy, ProtocolMessageFormatPolicy, ProtocolCompatibilityPolicy, ProtocolValidationPolicy, ProtocolExecutionPolicy, ProtocolDependencyPolicy, ProtocolTopology, RUNTIME_PROTOCOL_MODELS, PROTOCOL_SEQUENCE } from '../src/execution/ExecutionRuntimeProtocol';
import { DevelopmentRules } from '../src/aios/DevelopmentRules';
// Use require for Node modules to bypass type compilation scope restrictions
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
function testProtocolStructureAndImmutability() {
  console.log('[Test 1] Protocol structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT), 'EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getExecutionRuntimeProtocol();
  assert(Object.isFrozen(manager), 'Protocol Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Protocol Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Protocol Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Protocol Data must be frozen');
  assert(Object.isFrozen(manager.data.protocolModels), 'Protocol Models must be frozen');
  assert(Object.isFrozen(PROTOCOL_SEQUENCE), 'PROTOCOL_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_PROTOCOL_MODELS), 'RUNTIME_PROTOCOL_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-protocol-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Protocol Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Protocol Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testProtocolContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getContext();
  assert(context.runtimeProtocolId === 'runtime-protocol-01', 'Context must have runtimeProtocolId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeProtocolId', 'Context must contain only runtimeProtocolId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No threads, schedulers, queues, tasks, workers, dispatchers, event loop, connection, transport, etc.)
function testProtocolRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getExecutionRuntimeProtocol();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'negotiate', 'serialize', 'deserialize', 'encode', 'decode', 'handshakeProtocol', 'validatePacket', 'parseFrame', 'buildFrame',
    'thread', 'scheduler', 'queue', 'task', 'worker', 'dispatcher', 'event', 'eventBus', 'router', 'transport', 'connection', 'socket', 'packet', 'frame'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeProtocol data must not contain method or property: ${key}`);
  }

  // Check Protocol Policies
  const models = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getProtocolModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(ProtocolExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_CONNECTION), 'Must include NO_CONNECTION policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_SOCKET), 'Must include NO_SOCKET policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_PACKET), 'Must include NO_PACKET policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_FRAME), 'Must include NO_FRAME policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_SERIALIZATION), 'Must include NO_SERIALIZATION policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_DESERIALIZATION), 'Must include NO_DESERIALIZATION policy');
    assert(policies.includes(ProtocolExecutionPolicy.NO_NEGOTIATION), 'Must include NO_NEGOTIATION policy');
    
    // Check that supportedCapabilities, dependencyPolicy, topology, supportedSerializationPolicies, supportedVersionPolicies, supportedMessageFormatPolicies, supportedCompatibilityPolicies, supportedValidationPolicies exist and are immutable
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(model.dependencyPolicy !== undefined, 'dependencyPolicy must be defined');
    assert(model.topology !== undefined, 'topology must be defined');
    assert(model.supportedSerializationPolicies !== undefined, 'supportedSerializationPolicies must be defined');
    assert(model.supportedVersionPolicies !== undefined, 'supportedVersionPolicies must be defined');
    assert(model.supportedMessageFormatPolicies !== undefined, 'supportedMessageFormatPolicies must be defined');
    assert(model.supportedCompatibilityPolicies !== undefined, 'supportedCompatibilityPolicies must be defined');
    assert(model.supportedValidationPolicies !== undefined, 'supportedValidationPolicies must be defined');
    assert(model.metadata.protocolSchemaVersion === '1.0', 'Invalid protocolSchemaVersion');

    // Confirm that enums contain recommended values
    for (const cap of model.supportedCapabilities) {
      assert(Object.values(ProtocolCapability).includes(cap), `Invalid capability: ${cap}`);
    }
    assert(Object.values(ProtocolTopology).includes(model.topology), 'Invalid topology');
    for (const serialization of model.supportedSerializationPolicies) {
      assert(Object.values(ProtocolSerializationPolicy).includes(serialization), 'Invalid serialization policy');
    }
    for (const version of model.supportedVersionPolicies) {
      assert(Object.values(ProtocolVersionPolicy).includes(version), 'Invalid version policy');
    }
    for (const format of model.supportedMessageFormatPolicies) {
      assert(Object.values(ProtocolMessageFormatPolicy).includes(format), 'Invalid message format policy');
    }
    for (const compatibility of model.supportedCompatibilityPolicies) {
      assert(Object.values(ProtocolCompatibilityPolicy).includes(compatibility), 'Invalid compatibility policy');
    }
    for (const validation of model.supportedValidationPolicies) {
      assert(Object.values(ProtocolValidationPolicy).includes(validation), 'Invalid validation policy');
    }
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testProtocolDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getExecutionRuntimeProtocol();
  const m2 = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getExecutionRuntimeProtocol();
  assert(m1 === m2, 'getExecutionRuntimeProtocol must return identical references');

  const c1 = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const protocol = DevelopmentRules.getExecutionRuntimeProtocol(rule);
  
  assert(protocol !== undefined, 'getExecutionRuntimeProtocol must resolve properly');
  assert(protocol === EXECUTION_RUNTIME_PROTOCOL_BLUEPRINT.getExecutionRuntimeProtocol(), 'Resolved protocol must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure no runtime logic methods/constructs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeProtocol.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await
  const forbiddenPatterns = [
    { pattern: /\bconnect\s*\(/, name: 'connect()' },
    { pattern: /\bdisconnect\s*\(/, name: 'disconnect()' },
    { pattern: /\bsend\s*\(/, name: 'send()' },
    { pattern: /\breceive\s*\(/, name: 'receive()' },
    { pattern: /\bserialize\s*\(/, name: 'serialize()' },
    { pattern: /\bdeserialize\s*\(/, name: 'deserialize()' },
    { pattern: /\bnegotiate\s*\(/, name: 'negotiate()' },
    { pattern: /\bencode\s*\(/, name: 'encode()' },
    { pattern: /\bdecode\s*\(/, name: 'decode()' },
    { pattern: /\bhandshakeProtocol\s*\(/, name: 'handshakeProtocol()' },
    { pattern: /\bvalidatePacket\s*\(/, name: 'validatePacket()' },
    { pattern: /\bparseFrame\s*\(/, name: 'parseFrame()' },
    { pattern: /\bbuildFrame\s*\(/, name: 'buildFrame()' },
    { pattern: /\bPromise\b/, name: 'Promise' },
    { pattern: /\basync\b/, name: 'async' },
    { pattern: /\bawait\b/, name: 'await' }
  ];

  for (const item of forbiddenPatterns) {
    assert(!item.pattern.test(content), `Source code contains forbidden pattern: ${item.name}`);
  }

  console.log('[Test 6] PASSED');
}

// Execute Tests
setupAllEnvironments();
testProtocolStructureAndImmutability();
testProtocolContextIdOnly();
testProtocolRuntimeLogicSeparation();
testProtocolDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME PROTOCOL TESTS PASSED');
console.log('======================================\n');
