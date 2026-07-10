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
import { RuntimeTaskRegistry as TestRuntimeTaskRegistry, RuntimeTaskState, RuntimeTaskType as TestTaskType } from '../src/aios/RuntimeTaskRegistry';
import { RuntimeTaskFactory } from '../src/aios/RuntimeTaskFactory';
import { RuntimeExecutionPlanRegistry, RuntimeExecutionPlanState, ExecutionStrategy } from '../src/aios/RuntimeExecutionPlanRegistry';
import { RuntimeExecutionPlanFactory } from '../src/aios/RuntimeExecutionPlanFactory';
import { RuntimeExecutionGraphRegistry, RuntimeExecutionGraphState } from '../src/aios/RuntimeExecutionGraphRegistry';
import { RuntimeExecutionGraphFactory } from '../src/aios/RuntimeExecutionGraphFactory';
import { EXECUTION_RUNTIME_TASK_BLUEPRINT, TaskType, TaskScope, RuntimeTaskType, TaskLifecycleState, TaskExecutionPolicy, TaskCapability, TaskDependencyPolicy, RUNTIME_TASK_MODELS, TASK_SEQUENCE } from '../src/execution/ExecutionRuntimeTask';
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
  RuntimeQueueRegistry.clear();
  RuntimeQueueFactory.resetCounter();
  TestRuntimeTaskRegistry.clear();
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
  const task = RuntimeTaskFactory.create('TestTask', 'queue-1', TestTaskType.VALIDATION, RuntimeTaskState.CREATED);
  TestRuntimeTaskRegistry.register(task);

  // Register Plan
  const plan = RuntimeExecutionPlanFactory.create('TestPlan', 'task-1', ExecutionStrategy.SEQUENTIAL, RuntimeExecutionPlanState.CREATED);
  RuntimeExecutionPlanRegistry.register(plan);

  // Register Graph
  const graph = RuntimeExecutionGraphFactory.create('TestGraph', ['plan-1'], RuntimeExecutionGraphState.CREATED);
  RuntimeExecutionGraphRegistry.register(graph);
}

// 1. Structure, Immutability, and Getter Only check
function testTaskStructureAndImmutability() {
  console.log('[Test 1] Task structure and immutability check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_TASK_BLUEPRINT), 'EXECUTION_RUNTIME_TASK_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_TASK_BLUEPRINT.getExecutionRuntimeTask();
  assert(Object.isFrozen(manager), 'Task Manager must be frozen');
  assert(Object.isFrozen(manager.metadata), 'Task Metadata must be frozen');
  assert(Object.isFrozen(manager.context), 'Task Context must be frozen');
  assert(Object.isFrozen(manager.data), 'Task Data must be frozen');
  assert(Object.isFrozen(manager.data.taskModels), 'Task Models must be frozen');
  assert(Object.isFrozen(TASK_SEQUENCE), 'TASK_SEQUENCE must be frozen');
  assert(Object.isFrozen(RUNTIME_TASK_MODELS), 'RUNTIME_TASK_MODELS must be frozen');
  
  // Verify metadata fields
  const metadata = EXECUTION_RUNTIME_TASK_BLUEPRINT.getMetadata();
  assert(metadata.id === 'runtime-task-meta-01', 'Invalid metadata ID');
  assert(metadata.name === 'Execution Runtime Task Metadata', 'Invalid metadata Name');
  assert(metadata.version === '1.0.0', 'Invalid metadata Version');
  assert(metadata.layer === 'Task Layer', 'Invalid metadata Layer');
  assert(metadata.category === 'Infrastructure', 'Invalid metadata Category');

  console.log('[Test 1] PASSED');
}

// 2. Context ID Only check
function testTaskContextIdOnly() {
  console.log('[Test 2] Context ID Only check starting...');
  
  const context = EXECUTION_RUNTIME_TASK_BLUEPRINT.getContext();
  assert(context.runtimeTaskId === 'runtime-task-01', 'Context must have runtimeTaskId');
  
  // Verify that context does NOT contain any direct references to other entities
  const keys = Object.keys(context);
  assert(keys.length === 1 && keys[0] === 'runtimeTaskId', 'Context must contain only runtimeTaskId');
  
  console.log('[Test 2] PASSED');
}

// 3. Runtime Logic Separation check (No threads, schedulers, queues, workers, event loop, tasks, etc.)
function testTaskRuntimeLogicSeparation() {
  console.log('[Test 3] Runtime logic separation check starting...');

  const blueprint: any = EXECUTION_RUNTIME_TASK_BLUEPRINT;
  const manager: any = EXECUTION_RUNTIME_TASK_BLUEPRINT.getExecutionRuntimeTask();

  // Ensure forbidden properties/methods do not exist
  const forbiddenKeys = [
    'createTask', 'executeTask', 'cancelTask', 'retryTask', 'dispatchTask', 
    'assignThread', 'assignWorker', 'completeTask', 'failTask',
    'thread', 'scheduler', 'queue', 'worker', 'eventLoop', 'kernel'
  ];

  for (const key of forbiddenKeys) {
    assert(blueprint[key] === undefined, `EXECUTION_RUNTIME_TASK_BLUEPRINT must not contain method or property: ${key}`);
    assert(manager[key] === undefined, `ExecutionRuntimeTask data must not contain method or property: ${key}`);
  }

  // Check Task Policies explicitly include NO_THREAD, NO_SCHEDULER, NO_QUEUE, NO_WORKER, NO_EVENT_LOOP, NO_EXECUTION, NO_DISPATCH, NO_RETRY, NO_CANCEL
  const models = EXECUTION_RUNTIME_TASK_BLUEPRINT.getTaskModels();
  for (const model of models) {
    const policies = model.executionPolicies;
    assert(policies.includes(TaskExecutionPolicy.NO_THREAD), 'Must include NO_THREAD policy');
    assert(policies.includes(TaskExecutionPolicy.NO_SCHEDULER), 'Must include NO_SCHEDULER policy');
    assert(policies.includes(TaskExecutionPolicy.NO_QUEUE), 'Must include NO_QUEUE policy');
    assert(policies.includes(TaskExecutionPolicy.NO_WORKER), 'Must include NO_WORKER policy');
    assert(policies.includes(TaskExecutionPolicy.NO_EVENT_LOOP), 'Must include NO_EVENT_LOOP policy');
    assert(policies.includes(TaskExecutionPolicy.NO_EXECUTION), 'Must include NO_EXECUTION policy');
    assert(policies.includes(TaskExecutionPolicy.NO_DISPATCH), 'Must include NO_DISPATCH policy');
    assert(policies.includes(TaskExecutionPolicy.NO_RETRY), 'Must include NO_RETRY policy');
    assert(policies.includes(TaskExecutionPolicy.NO_CANCEL), 'Must include NO_CANCEL policy');
    
    // Check that supportedCapabilities and dependencyPolicy exist and are immutable
    assert(Object.isFrozen(model.supportedCapabilities), 'supportedCapabilities must be frozen');
    assert(model.dependencyPolicy !== undefined, 'dependencyPolicy must be defined');
    assert(model.metadata.taskSchemaVersion === '1.0', 'Invalid taskSchemaVersion');
  }

  console.log('[Test 3] PASSED');
}

// 4. Deterministic resolution check
function testTaskDeterministicResolution() {
  console.log('[Test 4] Deterministic check starting...');
  
  const m1 = EXECUTION_RUNTIME_TASK_BLUEPRINT.getExecutionRuntimeTask();
  const m2 = EXECUTION_RUNTIME_TASK_BLUEPRINT.getExecutionRuntimeTask();
  assert(m1 === m2, 'getExecutionRuntimeTask must return identical references');

  const c1 = EXECUTION_RUNTIME_TASK_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_TASK_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext must return identical references');

  const d1 = EXECUTION_RUNTIME_TASK_BLUEPRINT.getData();
  const d2 = EXECUTION_RUNTIME_TASK_BLUEPRINT.getData();
  assert(d1 === d2, 'getData must return identical references');

  console.log('[Test 4] PASSED');
}

// 5. DevelopmentRules Integration check
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration check starting...');
  
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const task = DevelopmentRules.getExecutionRuntimeTask(rule);
  
  assert(task !== undefined, 'getExecutionRuntimeTask must resolve properly');
  assert(task === EXECUTION_RUNTIME_TASK_BLUEPRINT.getExecutionRuntimeTask(), 'Resolved task must be equal to singleton');

  console.log('[Test 5] PASSED');
}

// Execute Tests
setupAllEnvironments();
testTaskStructureAndImmutability();
testTaskContextIdOnly();
testTaskRuntimeLogicSeparation();
testTaskDeterministicResolution();
testDevelopmentRulesIntegration();

console.log('\n======================================');
console.log('  ALL RUNTIME TASK TESTS PASSED');
console.log('======================================\n');
