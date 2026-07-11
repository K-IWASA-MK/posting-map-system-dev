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
import { EXECUTION_RUNTIME_HYDRATION_LOGIC } from '../../../src/execution/ExecutionRuntimeHydration';
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
function testHydrationStructureAndImmutability() {
  console.log('[Test 1] Hydration metadata and result structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_HYDRATION_LOGIC), 'EXECUTION_RUNTIME_HYDRATION_LOGIC container must be frozen');
  
  const metadata = EXECUTION_RUNTIME_HYDRATION_LOGIC.getHydrationMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 205-2', 'Metadata phase mismatch');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Hydration resolve result validation
function testHydrationLogicExecutionAndReadonly() {
  console.log('[Test 2] Hydration logic execution and result validation starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const result = EXECUTION_RUNTIME_HYDRATION_LOGIC.hydrateContext(rule);

  assert(result !== undefined, 'Hydration result should be resolved');
  assert(Object.isFrozen(result), 'Returned hydration result must be frozen');

  assert(result?.runtimeManagerId === 'runtime-manager-01', 'Manager ID mismatch');
  assert(result?.runtimeSessionId === 'runtime-session-01', 'Session ID mismatch');
  assert(result?.runtimeContextId === 'runtime-context-01', 'Context ID mismatch');
  assert(result?.runtimeRegistryId === 'registry-runtime-01', 'Registry ID mismatch');
  assert(result?.runtimeResolverId === 'runtime-resolver-01', 'Resolver ID mismatch');
  assert(result?.hydratorId === 'context-hydrator-01', 'Hydrator ID mismatch');

  console.log('[Test 2] Hydration logic execution and result validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Hydration referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const h1 = EXECUTION_RUNTIME_HYDRATION_LOGIC.hydrateContext(rule);
  const h2 = EXECUTION_RUNTIME_HYDRATION_LOGIC.hydrateContext(rule);
  
  assert(h1 === h2, 'Consecutive hydration calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeLogicExecution() {
  console.log('[Test 4] Verifying total absence of runtime execute/control/binding APIs...');

  const forbiddenMethods = [
    'create', 'instantiate', 'hydrateRuntime', 'bind', 'attach',
    'execute', 'dispatch', 'schedule', 'queue', 
    'ai', 'shell', 'browser', 'mcp'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_HYDRATION_LOGIC as any)[method] === undefined, `EXECUTION_RUNTIME_HYDRATION_LOGIC should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active runtime execution APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const result = DevelopmentRules.getExecutionRuntimeHydrationLogic(rule);
  
  assert(result !== undefined, 'getExecutionRuntimeHydrationLogic should return a valid result');
  assert(result?.hydratorId === 'context-hydrator-01', 'Resolved hydrator ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeHydrationLogic(ruleWithoutPipeline) === undefined, 'Rules hydrator should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testHydrationStructureAndImmutability();
    testHydrationLogicExecutionAndReadonly();
    testReferentialDeterminism();
    testAbsenceOfRuntimeLogicExecution();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Context Hydration Logic Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
