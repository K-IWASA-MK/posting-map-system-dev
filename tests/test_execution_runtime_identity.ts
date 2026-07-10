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
import { EXECUTION_RUNTIME_IDENTITY_BLUEPRINT, IdentityType, IdentityScope, RuntimeIdentityType, IdentityLifecycleState, IdentityCapability, IdentityCategory, IdentityTrustPolicy, IdentityValidationPolicy, IdentitySecurityPolicy, IdentityExecutionPolicy, IdentityDependencyPolicy, IdentityTopology, RUNTIME_IDENTITY_MODELS, IDENTITY_SEQUENCE } from '../src/execution/ExecutionRuntimeIdentity';
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
function testIdentityStructureAndImmutability() {
  console.log('[Test 1] Identity structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_IDENTITY_BLUEPRINT), 'EXECUTION_RUNTIME_IDENTITY_BLUEPRINT container must be frozen');
  
  const identity = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getExecutionRuntimeIdentity();
  assert(Object.isFrozen(identity), 'Identity must be frozen');
  assert(Object.isFrozen(identity.metadata), 'Identity Metadata must be frozen');
  assert(Object.isFrozen(identity.context), 'Identity Context must be frozen');
  assert(Object.isFrozen(identity.data), 'Identity Data must be frozen');
  assert(Object.isFrozen(identity.data.identityModels), 'Identity Models array must be frozen');
  assert(Object.isFrozen(IDENTITY_SEQUENCE), 'IDENTITY_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_IDENTITY_MODELS), 'RUNTIME_IDENTITY_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-identity-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Identity Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Identity Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testIdentityContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getContext();
  assert(context.runtimeIdentityId === 'runtime-identity-01', 'Context must have runtimeIdentityId');
  
  // Verify that context does NOT contain any direct references or credentials/tokens/secrets
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeIdentityId', 'Context must contain only runtimeIdentityId');
  
  const forbiddenContextKeys = ['identityRef', 'credential', 'token', 'sessionRef', 'connectionRef', 'secret', 'password', 'key', 'privateKey', 'publicKey'];
  for (const key of forbiddenContextKeys) {
    assert((context as any)[key] === undefined, `Context must not contain key: ${key}`);
  }
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check
function testIdentityRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT;
  const identity: any = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getExecutionRuntimeIdentity();

  // Ensure forbidden properties/methods do not exist in the Blueprint
  const forbiddenKeys = [
    'createIdentity', 'generateIdentity', 'validateIdentity', 'authenticate', 'authorize', 'issueToken', 'createToken', 'refreshToken',
    'credential', 'password', 'secret', 'privateKey', 'publicKey', 'socket', 'stream'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_IDENTITY_BLUEPRINT must not contain: ${key}`);
    assert(identity[key] === undefined, `ExecutionRuntimeIdentity must not contain: ${key}`);
  }

  // Check Identity Policies
  const models = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getIdentityModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(IdentityExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_DISPATCHER), 'Must include NO_DISPATCHER policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_EVENT), 'Must include NO_EVENT policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_EVENT_BUS), 'Must include NO_EVENT_BUS policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_ROUTER), 'Must include NO_ROUTER policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_TRANSPORT), 'Must include NO_TRANSPORT policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_CONNECTION), 'Must include NO_CONNECTION policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_PROTOCOL), 'Must include NO_PROTOCOL policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_SESSION), 'Must include NO_SESSION policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_TOKEN), 'Must include NO_TOKEN policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_CREDENTIAL), 'Must include NO_CREDENTIAL policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_AUTHENTICATION), 'Must include NO_AUTHENTICATION policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_AUTHORIZATION), 'Must include NO_AUTHORIZATION policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_IDENTITY_CREATE), 'Must include NO_IDENTITY_CREATE policy');
    assert(policies.includes(IdentityExecutionPolicy.NO_IDENTITY_VALIDATE), 'Must include NO_IDENTITY_VALIDATE policy');
    
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(Object.isFrozen(model.supportedTrustPolicies), 'supportedTrustPolicies must be frozen');
    assert(Object.isFrozen(model.supportedSecurityPolicies), 'supportedSecurityPolicies must be frozen');
    assert(Object.isFrozen(model.supportedValidationPolicies), 'supportedValidationPolicies must be frozen');
    assert(Object.isFrozen(model.lifecycleStates), 'lifecycleStates must be frozen');
    assert(Object.isFrozen(model.executionPolicies), 'executionPolicies must be frozen');
    assert(Object.isFrozen(model.allowedSteps), 'allowedSteps must be frozen');
    assert(Object.isFrozen(model.supportedSessionPolicies), 'supportedSessionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedConnectionPolicies), 'supportedConnectionPolicies must be frozen');
    assert(Object.isFrozen(model.supportedSecureChannelPolicies), 'supportedSecureChannelPolicies must be frozen');
    assert(Object.isFrozen(model.metadata), 'model metadata must be frozen');
    assert(Object.isFrozen(model), 'model must be frozen');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testIdentityDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const i1 = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getExecutionRuntimeIdentity();
  const i2 = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getExecutionRuntimeIdentity();
  assert(i1 === i2, 'getExecutionRuntimeIdentity must return identical references');

  const c1 = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const identity = DevelopmentRules.getExecutionRuntimeIdentity(rule);
  
  assert(identity !== undefined, 'getExecutionRuntimeIdentity must resolve properly');
  assert(identity === EXECUTION_RUNTIME_IDENTITY_BLUEPRINT.getExecutionRuntimeIdentity(), 'Resolved identity must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// 6. Source code static scan check (Ensure absolutely no runtime logic methods or network APIs)
function testSourceCodeStaticScan() {
  console.log('[Test 6] Source code static scan check starting...');

  const srcPath = path.join(process.cwd(), 'src/execution/ExecutionRuntimeIdentity.ts');
  const content = fs.readFileSync(srcPath, 'utf8');

  // Forbidden patterns: function definitions/calls for execution methods, or Promise/async/await/Timer/network APIs
  const forbiddenPatterns = [
    { pattern: /\bcreateIdentity\s*\(/, name: 'createIdentity()' },
    { pattern: /\bgenerateIdentity\s*\(/, name: 'generateIdentity()' },
    { pattern: /\bvalidateIdentity\s*\(/, name: 'validateIdentity()' },
    { pattern: /\bauthenticate\s*\(/, name: 'authenticate()' },
    { pattern: /\bauthorize\s*\(/, name: 'authorize()' },
    { pattern: /\bissueToken\s*\(/, name: 'issueToken()' },
    { pattern: /\bcreateToken\s*\(/, name: 'createToken()' },
    { pattern: /\brefreshToken\s*\(/, name: 'refreshToken()' },
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
testIdentityStructureAndImmutability();
testIdentityContextIdOnly();
testIdentityRuntimeLogicSeparation();
testIdentityDeterministicResolution();
testDevelopmentRulesIntegration();
testSourceCodeStaticScan();

console.log('\n======================================');
console.log('  ALL RUNTIME IDENTITY TESTS PASSED');
console.log('======================================\n');
