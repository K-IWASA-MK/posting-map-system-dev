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
import { RuntimeSessionType, EXECUTION_RUNTIME_SESSION_BLUEPRINT } from '../src/execution/ExecutionRuntimeSession';
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

  // Register Runtime (ID: runtime-1)
  const runtime = RuntimeFactory.create('TestRuntime', RuntimeState.CREATED, RuntimeMode.SANDBOX, 'Desc', '1.0.0');
  RuntimeRegistry.register(runtime);

  // Register Session (ID: session-1)
  const session = RuntimeSessionFactory.create('TestSession', 'runtime-1', 'Desc', RuntimeSessionState.CREATED);
  RuntimeSessionRegistry.register(session);

  // Register Context (ID: context-1)
  const context = RuntimeContextFactory.create('TestContext', 'session-1', 'Desc', RuntimeContextState.CREATED);
  RuntimeContextRegistry.register(context);

  // Register Queue (ID: queue-1)
  const queue = RuntimeQueueFactory.create('TestQueue', 'context-1', 'Desc', RuntimeQueueState.CREATED, QueuePriority.NORMAL);
  RuntimeQueueRegistry.register(queue);

  // Register Task (ID: task-1)
  const task = RuntimeTaskFactory.create('TestTask', 'queue-1', RuntimeTaskType.VALIDATION, RuntimeTaskState.CREATED);
  RuntimeTaskRegistry.register(task);

  // Register Plan (ID: plan-1)
  const plan = RuntimeExecutionPlanFactory.create('TestPlan', 'task-1', ExecutionStrategy.SEQUENTIAL, RuntimeExecutionPlanState.CREATED);
  RuntimeExecutionPlanRegistry.register(plan);

  // Register Graph (ID: graph-1)
  const graph = RuntimeExecutionGraphFactory.create('TestGraph', ['plan-1'], RuntimeExecutionGraphState.CREATED);
  RuntimeExecutionGraphRegistry.register(graph);
}

// 1. Enum verification
function testEnums() {
  console.log('[Test 1] RuntimeSessionType Enum verification starting...');
  assert(RuntimeSessionType.FOUNDATION === 'FOUNDATION', 'FOUNDATION enum mismatch');
  assert(RuntimeSessionType.RUNTIME === 'RUNTIME', 'RUNTIME enum mismatch');
  assert(RuntimeSessionType.SIMULATION === 'SIMULATION', 'SIMULATION enum mismatch');
  assert(RuntimeSessionType.PLUGIN === 'PLUGIN', 'PLUGIN enum mismatch');
  assert(RuntimeSessionType.AI === 'AI', 'AI enum mismatch');
  console.log('[Test 1] Enum verification: PASSED');
}

// 2. Blueprint structure and Object.isFrozen verification
function testBlueprintStructureAndFreeze() {
  console.log('[Test 2] ExecutionRuntimeSessionBlueprint structure and immutability verification starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_SESSION_BLUEPRINT), 'EXECUTION_RUNTIME_SESSION_BLUEPRINT must be frozen');
  
  const runtimeSession = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getRuntimeSession();
  assert(Object.isFrozen(runtimeSession), 'getRuntimeSession() must be frozen');
  assert(Object.isFrozen(runtimeSession.context), 'Session Context Reference must be frozen');
  assert(Object.isFrozen(runtimeSession.metadata), 'Metadata must be frozen');

  // Verify properties
  assert(runtimeSession.id === 'runtime-session-01', 'Runtime Session ID mismatch');
  assert(runtimeSession.name === 'Default Execution Runtime Session', 'Runtime Session Name mismatch');
  assert(runtimeSession.runtimeSessionType === RuntimeSessionType.FOUNDATION, 'Runtime Session Type mismatch');
  
  // Verify context IDs
  const context = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getContext();
  assert(context.runtimeId === 'execution-runtime-01', 'runtimeId ID mismatch');
  assert(context.runtimeRegistryId === 'registry-runtime-01', 'runtimeRegistryId ID mismatch');
  assert(context.runtimeContextId === 'runtime-context-01', 'runtimeContextId ID mismatch');
  assert(context.hydratorId === 'context-hydrator-01', 'hydratorId ID mismatch');
  assert(context.validatorId === 'blueprint-validator-01', 'validatorId ID mismatch');
  assert(context.dispatcherId === 'execution-dispatcher-01', 'dispatcherId ID mismatch');
  assert(context.resolverId === 'execution-resolver-01', 'resolverId ID mismatch');
  assert(context.executionStateId === 'execution-state-01', 'executionStateId ID mismatch');

  // Verify metadata properties
  const metadata = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 204-6', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionRuntimeSessionBlueprint structure and immutability verification: PASSED');
}

// 3. Getter API and Pure Declarative check (No start / resume / pause / close / etc.)
function testBlueprintGettersAndAbsenceOfRuntimeLogic() {
  console.log('[Test 3] Blueprint Getter APIs and runtime logic absence check starting...');

  const runtimeSession = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getRuntimeSession();
  
  // Verify that active methods DO NOT exist on the model or the container
  const forbiddenMethods = [
    'create', 'start', 'stop', 'resume', 'pause', 
    'close', 'destroy', 'execute'
  ];

  for (const method of forbiddenMethods) {
    assert((runtimeSession as any)[method] === undefined, `Method ${method} should not exist on ExecutionRuntimeSession model`);
    assert((EXECUTION_RUNTIME_SESSION_BLUEPRINT as any)[method] === undefined, `Method ${method} should not exist on EXECUTION_RUNTIME_SESSION_BLUEPRINT container`);
  }

  console.log('[Test 3] Blueprint Getter APIs and runtime logic absence check: PASSED');
}

// 4. Deterministic Reference verification
function testReferenceDeterminism() {
  console.log('[Test 4] Blueprint referential determinism checks starting...');
  
  const v1 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getRuntimeSession();
  const v2 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getRuntimeSession();
  assert(v1 === v2, 'getRuntimeSession() must return the exact same frozen reference');

  const c1 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getContext();
  const c2 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext() must return the exact same frozen reference');

  const m1 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_RUNTIME_SESSION_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Blueprint referential determinism checks: PASSED');
}

// 5. DevelopmentRules Static Mapping Integration Verification
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const runtimeSession = DevelopmentRules.getExecutionRuntimeSession(rule);
  assert(runtimeSession !== undefined, 'getExecutionRuntimeSession should resolve the session descriptor statically');
  assert(runtimeSession?.id === 'runtime-session-01', 'Resolved session ID mismatch');
  assert(runtimeSession?.runtimeSessionType === RuntimeSessionType.FOUNDATION, 'Resolved session type mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const runtimeSession2 = DevelopmentRules.getExecutionRuntimeSession(rule);
  assert(runtimeSession === runtimeSession2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeSession(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testEnums();
    testBlueprintStructureAndFreeze();
    testBlueprintGettersAndAbsenceOfRuntimeLogic();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Runtime Session Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
