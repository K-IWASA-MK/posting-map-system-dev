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
import { EXECUTION_RUNTIME_ENGINE_BLUEPRINT, EngineType } from '../src/execution/ExecutionRuntimeEngine';
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

// 1. Structure and Immutability check
function testEngineStructureAndImmutability() {
  console.log('[Test 1] Engine metadata, context, and engine data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_ENGINE_BLUEPRINT), 'EXECUTION_RUNTIME_ENGINE_BLUEPRINT container must be frozen');
  
  const engine = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getEngine();
  assert(Object.isFrozen(engine), 'Engine data must be frozen');
  
  const context = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 206-1', 'Metadata phase mismatch');

  assert(EngineType.FOUNDATION === 'FOUNDATION', 'Enum EngineType check failed');
  assert(EngineType.RUNTIME === 'RUNTIME', 'Enum EngineType check failed');
  assert(EngineType.SIMULATION === 'SIMULATION', 'Enum EngineType check failed');
  assert(EngineType.PLUGIN === 'PLUGIN', 'Enum EngineType check failed');
  assert(EngineType.AI === 'AI', 'Enum EngineType check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Engine Context and Blueprint values checks
function testEngineBlueprintValues() {
  console.log('[Test 2] Engine context and blueprint values validation starting...');

  const engine = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getEngine();
  const context = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getContext();

  assert(engine.id === 'runtime-engine-01', 'Engine ID mismatch');
  assert(engine.engineType === EngineType.FOUNDATION, 'Engine type mismatch');
  assert(engine.context === context, 'Engine context mismatch');

  // Verify context holds only IDs
  assert(context.runtimeManagerId === 'runtime-manager-01', 'Context runtimeManagerId mismatch');
  assert(context.runtimeSessionId === 'runtime-session-01', 'Context runtimeSessionId mismatch');
  assert(context.runtimeContextId === 'runtime-context-01', 'Context runtimeContextId mismatch');
  assert(context.runtimeRegistryId === 'registry-runtime-01', 'Context runtimeRegistryId mismatch');
  assert(context.runtimeResolverId === 'runtime-resolver-01', 'Context runtimeResolverId mismatch');
  assert(context.hydratorId === 'context-hydrator-01', 'Context hydratorId mismatch');
  assert(context.validatorId === 'blueprint-validator-01', 'Context validatorId mismatch');
  assert(context.dispatcherId === 'runtime-dispatcher-01', 'Context dispatcherId mismatch');
  assert(context.queueId === 'queue-1', 'Context queueId mismatch');
  assert(context.schedulerId === 'scheduler-1', 'Context schedulerId mismatch');
  assert(context.executorId === 'executor-1', 'Context executorId mismatch');

  console.log('[Test 2] Engine context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Engine referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const eng1 = DevelopmentRules.getExecutionRuntimeEngine(rule);
  const eng2 = DevelopmentRules.getExecutionRuntimeEngine(rule);
  
  assert(eng1 !== undefined, 'Engine should be resolved');
  assert(eng1 === eng2, 'Consecutive engine resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeExecution() {
  console.log('[Test 4] Verifying total absence of active execution/launcher/plugin APIs...');

  const forbiddenMethods = [
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess',
    'plugin', 'ai', 'shell', 'browser', 'mcp'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_ENGINE_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_ENGINE_BLUEPRINT should not contain ${method}`);
    const engine = EXECUTION_RUNTIME_ENGINE_BLUEPRINT.getEngine();
    assert((engine as any)[method] === undefined, `ExecutionRuntimeEngine object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active execution/launcher/plugin APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const engine = DevelopmentRules.getExecutionRuntimeEngine(rule);
  
  assert(engine !== undefined, 'getExecutionRuntimeEngine should return a valid result');
  assert(engine?.id === 'runtime-engine-01', 'Resolved engine ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeEngine(ruleWithoutPipeline) === undefined, 'Rules engine resolver should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testEngineStructureAndImmutability();
    testEngineBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeExecution();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Engine Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
