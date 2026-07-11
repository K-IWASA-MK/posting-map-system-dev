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
import { ResultType, ResultStatus, EXECUTION_RESULT_BLUEPRINT } from '../../../src/execution/ExecutionResult';
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

// ==============================================================================
// 1. ResultType, ResultStatus and Enum verification
// ==============================================================================
function testResultEnums() {
  console.log('[Test 1] ResultType and ResultStatus Enum values verification starting...');
  assert(ResultType.FOUNDATION === 'FOUNDATION', 'ResultType FOUNDATION mismatch');
  assert(ResultType.RUNTIME === 'RUNTIME', 'ResultType RUNTIME mismatch');
  assert(ResultType.SIMULATION === 'SIMULATION', 'ResultType SIMULATION mismatch');
  assert(ResultType.PLUGIN === 'PLUGIN', 'ResultType PLUGIN mismatch');
  assert(ResultType.AI === 'AI', 'ResultType AI mismatch');

  assert(ResultStatus.UNKNOWN === 'UNKNOWN', 'ResultStatus UNKNOWN mismatch');
  assert(ResultStatus.SUCCESS === 'SUCCESS', 'ResultStatus SUCCESS mismatch');
  assert(ResultStatus.FAILURE === 'FAILURE', 'ResultStatus FAILURE mismatch');
  assert(ResultStatus.PARTIAL === 'PARTIAL', 'ResultStatus PARTIAL mismatch');
  console.log('[Test 1] ResultType and ResultStatus Enum values verification: PASSED');
}

// ==============================================================================
// 2. Blueprint structure and multi-layer Object.isFrozen immutability verification
// ==============================================================================
function testResultStructureAndImmutability() {
  console.log('[Test 2] ExecutionResultBlueprint structure and immutability verification starting...');
  
  // Immutability checks on blueprint container itself
  assert(Object.isFrozen(EXECUTION_RESULT_BLUEPRINT), 'EXECUTION_RESULT_BLUEPRINT itself must be frozen');
  
  const result = EXECUTION_RESULT_BLUEPRINT.getResult();
  
  // Result Model Freeze
  assert(Object.isFrozen(result), 'getResult() result must be frozen');
  
  // Context Freeze
  assert(Object.isFrozen(result.context), 'Result context must be frozen');
  
  // Metadata Freeze
  assert(Object.isFrozen(result.metadata), 'Result metadata must be frozen');

  // Verify properties
  assert(result.id === 'execution-result-01', 'Result ID mismatch');
  assert(result.name === 'Default Execution Result', 'Result Name mismatch');
  assert(result.resultType === ResultType.FOUNDATION, 'Result Type mismatch');
  assert(result.status === ResultStatus.SUCCESS, 'Result Status mismatch');
  
  // Context ID references check
  const context = result.context;
  assert(context.executionRequest === 'execution-request-01', 'Context executionRequest ID mismatch');
  assert(context.executionEngine === 'engine-execution-01', 'Context executionEngine ID mismatch');
  assert(context.executionRegistry === 'registry-execution-01', 'Context executionRegistry ID mismatch');
  
  const metadata = EXECUTION_RESULT_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.phase === 'Phase 203-4', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionResultBlueprint structure and immutability verification: PASSED');
}

// ==============================================================================
// 3. Blueprint Getter APIs & declarative only validation
// ==============================================================================
function testResultGettersAndDeclarativeOnly() {
  console.log('[Test 3] Result Getter APIs and declarative logic checks starting...');
  
  const context = EXECUTION_RESULT_BLUEPRINT.getContext();
  const metadata = EXECUTION_RESULT_BLUEPRINT.getMetadata();
  const result = EXECUTION_RESULT_BLUEPRINT.getResult();

  assert(context !== undefined, 'getContext failed');
  assert(metadata !== undefined, 'getMetadata failed');
  assert(result !== undefined, 'getResult failed');

  // Assert absence of dynamic manipulation and execution methods on result model
  assert((result as any).create === undefined, 'No create method should exist on ExecutionResult model');
  assert((result as any).generate === undefined, 'No generate method should exist on ExecutionResult model');
  assert((result as any).execute === undefined, 'No execute method should exist on ExecutionResult model');
  assert((result as any).complete === undefined, 'No complete method should exist on ExecutionResult model');
  assert((result as any).fail === undefined, 'No fail method should exist on ExecutionResult model');
  assert((result as any).retry === undefined, 'No retry method should exist on ExecutionResult model');
  assert((result as any).log === undefined, 'No log method should exist on ExecutionResult model');
  assert((result as any).update === undefined, 'No update method should exist on ExecutionResult model');

  // Assert absence of dynamic manipulation and execution methods on blueprint container
  assert((EXECUTION_RESULT_BLUEPRINT as any).create === undefined, 'No create method should exist on blueprint container');
  assert((EXECUTION_RESULT_BLUEPRINT as any).generate === undefined, 'No generate method should exist on blueprint container');
  assert((EXECUTION_RESULT_BLUEPRINT as any).execute === undefined, 'No execute method should exist on blueprint container');
  assert((EXECUTION_RESULT_BLUEPRINT as any).complete === undefined, 'No complete method should exist on blueprint container');
  assert((EXECUTION_RESULT_BLUEPRINT as any).fail === undefined, 'No fail method should exist on blueprint container');
  assert((EXECUTION_RESULT_BLUEPRINT as any).retry === undefined, 'No retry method should exist on blueprint container');
  assert((EXECUTION_RESULT_BLUEPRINT as any).log === undefined, 'No log method should exist on blueprint container');
  assert((EXECUTION_RESULT_BLUEPRINT as any).update === undefined, 'No update method should exist on blueprint container');

  console.log('[Test 3] Result Getter APIs and declarative logic checks: PASSED');
}

// ==============================================================================
// 4. Deterministic Reference verification
// ==============================================================================
function testReferenceDeterminism() {
  console.log('[Test 4] Result referential determinism checks starting...');
  
  const r1 = EXECUTION_RESULT_BLUEPRINT.getResult();
  const r2 = EXECUTION_RESULT_BLUEPRINT.getResult();
  assert(r1 === r2, 'getResult() must return the exact same frozen reference');

  const c1 = EXECUTION_RESULT_BLUEPRINT.getContext();
  const c2 = EXECUTION_RESULT_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext() must return the exact same frozen reference');

  const m1 = EXECUTION_RESULT_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_RESULT_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Result referential determinism checks: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const result = DevelopmentRules.getExecutionResult(rule);
  assert(result !== undefined, 'getExecutionResult should resolve statically');
  assert(result?.id === 'execution-result-01', 'Resolved result ID mismatch');
  assert(result?.resultType === ResultType.FOUNDATION, 'Resolved result type mismatch');
  assert(result?.status === ResultStatus.SUCCESS, 'Resolved result status mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const result2 = DevelopmentRules.getExecutionResult(rule);
  assert(result === result2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionResult(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testResultEnums();
    testResultStructureAndImmutability();
    testResultGettersAndDeclarativeOnly();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Result Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
