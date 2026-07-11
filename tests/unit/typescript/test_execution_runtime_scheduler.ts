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
import { EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT, SchedulerType, SchedulerScope, RuntimeSchedulerType, SchedulerLifecycleState, SchedulerExecutionPolicy, RUNTIME_SCHEDULER_MODELS, SCHEDULER_SEQUENCE } from '../../../src/execution/ExecutionRuntimeScheduler';
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
function testSchedulerManagerStructureAndImmutability() {
  console.log('[Test 1] Scheduler Manager structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT), 'EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getExecutionRuntimeScheduler();
  assert(Object.isFrozen(manager), 'Scheduler Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Scheduler Manager Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Scheduler Manager Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Scheduler Manager Data must be frozen');
  assert(Object.isFrozen(manager.data.schedulerModels), 'Scheduler Manager Scheduler Models must be frozen');
  assert(Object.isFrozen(SCHEDULER_SEQUENCE), 'SCHEDULER_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_SCHEDULER_MODELS), 'RUNTIME_SCHEDULER_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-scheduler-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Scheduler Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Scheduler Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testSchedulerContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getContext();
  assert(context.runtimeSchedulerId === 'runtime-scheduler-01', 'Context must have runtimeSchedulerId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeSchedulerId', 'Context must contain only runtimeSchedulerId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No threads, queues, tasks, event loop, timers, dispatchers, etc.)
function testSchedulerRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getExecutionRuntimeScheduler();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'schedule', 'dispatch', 'enqueue', 'dequeue', 'wakeup', 'sleep', 
    'startScheduler', 'stopScheduler', 'tick',
    'thread', 'queue', 'task', 'worker', 'eventLoop', 'timer'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeScheduler data must not contain method or property: ${key}`);
  }

  // Check Scheduler Policies explicitly include NO_THREAD, NO_TASK, NO_QUEUE, NO_WORKER, NO_EVENT_LOOP, NO_TIMER, NO_DISPATCH, NO_PRIORITY_CALCULATION, NO_LOAD_BALANCING
  const models = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getSchedulerModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(SchedulerExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_TASK), 'Must include NO_TASK policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_EVENT_LOOP), 'Must include NO_EVENT_LOOP policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_TIMER), 'Must include NO_TIMER policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_DISPATCH), 'Must include NO_DISPATCH policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_PRIORITY_CALCULATION), 'Must include NO_PRIORITY_CALCULATION policy');
    assert(policies.includes(SchedulerExecutionPolicy.NO_LOAD_BALANCING), 'Must include NO_LOAD_BALANCING policy');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testSchedulerDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getExecutionRuntimeScheduler();
  const m2 = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getExecutionRuntimeScheduler();
  assert(m1 === m2, 'getExecutionRuntimeScheduler must return identical references');

  const c1 = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const scheduler = DevelopmentRules.getExecutionRuntimeScheduler(rule);
  
  assert(scheduler !== undefined, 'getExecutionRuntimeScheduler must resolve properly');
  assert(scheduler === EXECUTION_RUNTIME_SCHEDULER_BLUEPRINT.getExecutionRuntimeScheduler(), 'Resolved scheduler must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// Execute Tests
setupAllEnvironments();
testSchedulerManagerStructureAndImmutability();
testSchedulerContextIdOnly();
testSchedulerRuntimeLogicSeparation();
testSchedulerDeterministicResolution();
testDevelopmentRulesIntegration();

console.log('\n======================================');
console.log('  ALL RUNTIME SCHEDULER TESTS PASSED');
console.log('======================================\n');
