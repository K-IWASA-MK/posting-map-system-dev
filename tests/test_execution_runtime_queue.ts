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
import { RuntimeQueueRegistry as TestRuntimeQueueRegistry, RuntimeQueueState, QueuePriority } from '../src/aios/RuntimeQueueRegistry';
import { RuntimeQueueFactory } from '../src/aios/RuntimeQueueFactory';
import { RuntimeTaskRegistry, RuntimeTaskState, RuntimeTaskType } from '../src/aios/RuntimeTaskRegistry';
import { RuntimeTaskFactory } from '../src/aios/RuntimeTaskFactory';
import { RuntimeExecutionPlanRegistry, RuntimeExecutionPlanState, ExecutionStrategy } from '../src/aios/RuntimeExecutionPlanRegistry';
import { RuntimeExecutionPlanFactory } from '../src/aios/RuntimeExecutionPlanFactory';
import { RuntimeExecutionGraphRegistry, RuntimeExecutionGraphState } from '../src/aios/RuntimeExecutionGraphRegistry';
import { RuntimeExecutionGraphFactory } from '../src/aios/RuntimeExecutionGraphFactory';
import { EXECUTION_RUNTIME_QUEUE_BLUEPRINT, QueueType, QueueScope, RuntimeQueueType, QueueLifecycleState, QueueExecutionPolicy, RUNTIME_QUEUE_MODELS, QUEUE_SEQUENCE } from '../src/execution/ExecutionRuntimeQueue';
import { DevelopmentRules } from '../src/aios/DevelopmentRules';

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
  TestRuntimeQueueRegistry.clear();
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
  TestRuntimeQueueRegistry.register(queue);

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
function testQueueManagerStructureAndImmutability() {
  console.log('[Test 1] Queue Manager structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_QUEUE_BLUEPRINT), 'EXECUTION_RUNTIME_QUEUE_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getExecutionRuntimeQueue();
  assert(Object.isFrozen(manager), 'Queue Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Queue Manager Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Queue Manager Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Queue Manager Data must be frozen');
  assert(Object.isFrozen(manager.data.queueModels), 'Queue Manager Queue Models must be frozen');
  assert(Object.isFrozen(QUEUE_SEQUENCE), 'QUEUE_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_QUEUE_MODELS), 'RUNTIME_QUEUE_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-queue-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Queue Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Queue Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testQueueContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getContext();
  assert(context.runtimeQueueId === 'runtime-queue-01', 'Context must have runtimeQueueId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeQueueId', 'Context must contain only runtimeQueueId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No threads, schedulers, tasks, workers, event loop, queues, etc.)
function testQueueRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_QUEUE_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getExecutionRuntimeQueue();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'enqueue', 'dequeue', 'push', 'pop', 'shift', 'unshift', 'clear', 
    'dispatch', 'processQueue',
    'thread', 'scheduler', 'task', 'worker', 'eventLoop'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_QUEUE_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeQueue data must not contain method or property: ${key}`);
  }

  // Check Queue Policies explicitly include NO_THREAD, NO_SCHEDULER, NO_TASK, NO_WORKER, NO_EVENT_LOOP, NO_ENQUEUE, NO_DEQUEUE, NO_QUEUE_OPERATION, NO_PRIORITY, NO_SORT, NO_REORDER
  const models = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getQueueModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(QueueExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(QueueExecutionPolicy.NO_SCHEDULER), 'Must include NO_SCHEDULER policy');
    assert(policies.includes(QueueExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(QueueExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(QueueExecutionPolicy.NO_EVENT_LOOP), 'Must include NO_EVENT_LOOP policy');
    assert(policies.includes(QueueExecutionPolicy.NO_ENQUEUE), 'Must include NO_ENQUEUE policy');
    assert(policies.includes(QueueExecutionPolicy.NO_DEQUEUE), 'Must include NO_DEQUEUE policy');
    assert(policies.includes(QueueExecutionPolicy.NO_QUEUE_OPERATION), 'Must include NO_QUEUE_OPERATION policy');
    assert(policies.includes(QueueExecutionPolicy.NO_PRIORITY), 'Must include NO_PRIORITY policy');
    assert(policies.includes(QueueExecutionPolicy.NO_SORT), 'Must include NO_SORT policy');
    assert(policies.includes(QueueExecutionPolicy.NO_REORDER), 'Must include NO_REORDER policy');
    
    // Check that supportedQueuePolicies is immutable
    assert(Object.isFrozen(model.supportedQueuePolicies), 'supportedQueuePolicies must be frozen');
    assert(model.metadata.queueSchemaVersion === '1.0', 'Invalid queueSchemaVersion');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testQueueDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getExecutionRuntimeQueue();
  const m2 = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getExecutionRuntimeQueue();
  assert(m1 === m2, 'getExecutionRuntimeQueue must return identical references');

  const c1 = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const queue = DevelopmentRules.getExecutionRuntimeQueue(rule);
  
  assert(queue !== undefined, 'getExecutionRuntimeQueue must resolve properly');
  assert(queue === EXECUTION_RUNTIME_QUEUE_BLUEPRINT.getExecutionRuntimeQueue(), 'Resolved queue must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// Execute Tests
setupAllEnvironments();
testQueueManagerStructureAndImmutability();
testQueueContextIdOnly();
testQueueRuntimeLogicSeparation();
testQueueDeterministicResolution();
testDevelopmentRulesIntegration();

console.log('\n======================================');
console.log('  ALL RUNTIME QUEUE TESTS PASSED');
console.log('======================================\n');
