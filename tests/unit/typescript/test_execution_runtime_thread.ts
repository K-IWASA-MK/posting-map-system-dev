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
import { EXECUTION_RUNTIME_THREAD_BLUEPRINT, ThreadType, ThreadScope, RuntimeThreadType, ThreadLifecycleState, ThreadExecutionPolicy, RUNTIME_THREAD_MODELS, THREAD_SEQUENCE } from '../../../src/execution/ExecutionRuntimeThread';
import { DevelopmentRules } from '../../../src/aios/DevelopmentRules';

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
function testThreadManagerStructureAndImmutability() {
  console.log('[Test 1] Thread Manager structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_THREAD_BLUEPRINT), 'EXECUTION_RUNTIME_THREAD_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getExecutionRuntimeThread();
  assert(Object.isFrozen(manager), 'Thread Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Thread Manager Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Thread Manager Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Thread Manager Data must be frozen');
  assert(Object.isFrozen(manager.data.threadModels), 'Thread Manager Thread Models must be frozen');
  assert(Object.isFrozen(THREAD_SEQUENCE), 'THREAD_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_THREAD_MODELS), 'RUNTIME_THREAD_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-thread-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Thread Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Thread Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testThreadContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getContext();
  assert(context.runtimeThreadId === 'runtime-thread-01', 'Context must have runtimeThreadId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeThreadId', 'Context must contain only runtimeThreadId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No scheduler, queue, task, eventloop, worker, context-switch)
function testThreadRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_THREAD_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getExecutionRuntimeThread();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'createThread', 'startThread', 'stopThread', 'suspendThread', 'resumeThread', 
    'executeThread', 'dispatchThread', 'switchContext',
    'scheduler', 'queue', 'task', 'eventLoop', 'worker'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_THREAD_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeThread data must not contain method or property: ${key}`);
  }

  // Check Thread Policies explicitly include NO_SCHEDULER, NO_QUEUE, NO_EVENT_LOOP, NO_TASK, NO_CONTEXT_SWITCH
  const models = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getThreadModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(ThreadExecutionPolicy.NO_SCHEDULER), 'Must include NO_SCHEDULER policy');
    assert(policies.includes(ThreadExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(ThreadExecutionPolicy.NO_EVENT_LOOP), 'Must include NO_EVENT_LOOP policy');
    assert(policies.includes(ThreadExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(ThreadExecutionPolicy.NO_CONTEXT_SWITCH), 'Must include NO_CONTEXT_SWITCH policy');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testThreadDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getExecutionRuntimeThread();
  const m2 = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getExecutionRuntimeThread();
  assert(m1 === m2, 'getExecutionRuntimeThread must return identical references');

  const c1 = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_THREAD_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const thread = DevelopmentRules.getExecutionRuntimeThread(rule);
  
  assert(thread !== undefined, 'getExecutionRuntimeThread must resolve properly');
  assert(thread === EXECUTION_RUNTIME_THREAD_BLUEPRINT.getExecutionRuntimeThread(), 'Resolved thread must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// Execute Tests
setupAllEnvironments();
testThreadManagerStructureAndImmutability();
testThreadContextIdOnly();
testThreadRuntimeLogicSeparation();
testThreadDeterministicResolution();
testDevelopmentRulesIntegration();

console.log('\n======================================');
console.log('  ALL RUNTIME THREAD TESTS PASSED');
console.log('======================================\n');
