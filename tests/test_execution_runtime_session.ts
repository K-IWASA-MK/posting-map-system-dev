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
import { EXECUTION_RUNTIME_SESSION_BLUEPRINT, SessionType, SessionScope, RuntimeSessionType, SessionLifecycleState, SessionCapability, SessionCategory, SessionSecurityPolicy, SessionStatePolicy, SessionTimeoutPolicy, SessionIsolationPolicy, SessionIdentityPolicy, SessionExecutionPolicy, SessionDependencyPolicy, SessionTopology, RUNTIME_SESSION_MODELS, SESSION_SEQUENCE } from '../src/execution/ExecutionRuntimeSession';
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
function testSessionStructureAndImmutability() {
  console.log('[Test 1] Session structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_SESSION_BLUEPRINT), 'EXECUTION_RUNTIME_SESSION_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getExecutionRuntimeSession();
  assert(Object.isFrozen(manager), 'Session Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Session Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Session Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Session Data must be frozen');
  assert(Object.isFrozen(manager.data.sessionModels), 'Session Models must be frozen');
  assert(Object.isFrozen(SESSION_SEQUENCE), 'SESSION_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_SESSION_MODELS), 'RUNTIME_SESSION_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-session-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Session Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Session Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testSessionContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getContext();
  assert(context.runtimeSessionId === 'runtime-session-01', 'Context must have runtimeSessionId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeSessionId', 'Context must contain only runtimeSessionId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No threads, schedulers, queues, tasks, workers, dispatchers, event loop, connection, transport, protocol, etc.)
function testSessionRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_SESSION_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getExecutionRuntimeSession();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'createSession', 'openSession', 'closeSession', 'renewSession', 'refreshSession', 'resumeSession', 'terminateSession', 'authenticateSession', 'bindConnection', 'attachProtocol',
    'thread', 'scheduler', 'queue', 'task', 'worker', 'dispatcher', 'event', 'eventBus', 'router', 'transport', 'connection', 'protocol', 'socket', 'packet', 'frame', 'sessionStore', 'connectionRef', 'protocolRef'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_SESSION_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeSession data must not contain method or property: ${key}`);
  }

  // Check Session Policies
  const models = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getSessionModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(SessionExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(SessionExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(SessionExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(SessionExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(SessionExecutionPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(SessionExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(SessionExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(SessionExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(SessionExecutionPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(SessionExecutionPolicy.NO_CONNECTION), 'Must include NO_CONNECTION policy');
    assert(policies.includes(SessionExecutionPolicy.NO_PROTOCOL), 'Must include NO_PROTOCOL policy');
    assert(policies.includes(SessionExecutionPolicy.NO_SOCKET), 'Must include NO_SOCKET policy');
    assert(policies.includes(SessionExecutionPolicy.NO_BINDING), 'Must include NO_BINDING policy');
    assert(policies.includes(SessionExecutionPolicy.NO_AUTHENTICATION), 'Must include NO_AUTHENTICATION policy');
    assert(policies.includes(SessionExecutionPolicy.NO_REFRESH), 'Must include NO_REFRESH policy');
    assert(policies.includes(SessionExecutionPolicy.NO_RENEW), 'Must include NO_RENEW policy');
    
    // Check that supportedCapabilities, dependencyPolicy, topology, supportedSecurityPolicies, supportedStatePolicies, supportedTimeoutPolicies, supportedIsolationPolicies, supportedIdentityPolicies, supportedConnectionPolicies, supportedTransportPolicies, supportedProtocolPolicies exist and are immutable
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(model.dependencyPolicy !== undefined, 'dependencyPolicy must be defined');
    assert(model.topology !== undefined, 'topology must be defined');
    assert(model.supportedSecurityPolicies !== undefined, 'supportedSecurityPolicies must be defined');
    assert(model.supportedStatePolicies !== undefined, 'supportedStatePolicies must be defined');
    assert(model.supportedTimeoutPolicies !== undefined, 'supportedTimeoutPolicies must be defined');
    assert(model.supportedIsolationPolicies !== undefined, 'supportedIsolationPolicies must be defined');
    assert(model.supportedIdentityPolicies !== undefined, 'supportedIdentityPolicies must be defined');
    assert(model.supportedConnectionPolicies !== undefined, 'supportedConnectionPolicies must be defined');
    assert(model.supportedTransportPolicies !== undefined, 'supportedTransportPolicies must be defined');
    assert(model.supportedProtocolPolicies !== undefined, 'supportedProtocolPolicies must be defined');
    assert(model.metadata.sessionSchemaVersion === '1.0', 'Invalid sessionSchemaVersion');

    // Confirm that enums contain recommended values
    for (const cap of model.supportedCapabilities) {
      assert(Object.values(SessionCapability).includes(cap), `Invalid capability: ${cap}`);
    }
    assert(Object.values(SessionTopology).includes(model.topology), 'Invalid topology');
    for (const security of model.supportedSecurityPolicies) {
      assert(Object.values(SessionSecurityPolicy).includes(security), 'Invalid security');
    }
    for (const state of model.supportedStatePolicies) {
      assert(Object.values(SessionStatePolicy).includes(state), 'Invalid state policy');
    }
    for (const timeout of model.supportedTimeoutPolicies) {
      assert(Object.values(SessionTimeoutPolicy).includes(timeout), 'Invalid timeout policy');
    }
    for (const isolation of model.supportedIsolationPolicies) {
      assert(Object.values(SessionIsolationPolicy).includes(isolation), 'Invalid isolation policy');
    }
    for (const identity of model.supportedIdentityPolicies) {
      assert(Object.values(SessionIdentityPolicy).includes(identity), 'Invalid identity policy');
    }
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testSessionDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getExecutionRuntimeSession();
  const m2 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getExecutionRuntimeSession();
  assert(m1 === m2, 'getExecutionRuntimeSession must return identical references');

  const c1 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const session = DevelopmentRules.getExecutionRuntimeSession(rule);
  
  assert(session !== undefined, 'getExecutionRuntimeSession must resolve properly');
  assert(session === EXECUTION_RUNTIME_SESSION_BLUEPRINT.getExecutionRuntimeSession(), 'Resolved session must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure no runtime logic methods/constructs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeSession.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await
  const forbiddenPatterns = [
    { pattern: /\bcreateSession\s*\(/, name: 'createSession()' },
    { pattern: /\bopenSession\s*\(/, name: 'openSession()' },
    { pattern: /\bcloseSession\s*\(/, name: 'closeSession()' },
    { pattern: /\brenewSession\s*\(/, name: 'renewSession()' },
    { pattern: /\brefreshSession\s*\(/, name: 'refreshSession()' },
    { pattern: /\bresumeSession\s*\(/, name: 'resumeSession()' },
    { pattern: /\bterminateSession\s*\(/, name: 'terminateSession()' },
    { pattern: /\bauthenticateSession\s*\(/, name: 'authenticateSession()' },
    { pattern: /\bbindConnection\s*\(/, name: 'bindConnection()' },
    { pattern: /\battachProtocol\s*\(/, name: 'attachProtocol()' },
    { pattern: /\bSessionManager\b/, name: 'SessionManager' },
    { pattern: /\bRuntimeSessionInstance\b/, name: 'RuntimeSessionInstance' },
    { pattern: /\bsessionStore\b/, name: 'sessionStore' },
    { pattern: /\bconnectionRef\b/, name: 'connectionRef' },
    { pattern: /\bprotocolRef\b/, name: 'protocolRef' },
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
testSessionStructureAndImmutability();
testSessionContextIdOnly();
testSessionRuntimeLogicSeparation();
testSessionDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME SESSION TESTS PASSED');
console.log('======================================\n');
