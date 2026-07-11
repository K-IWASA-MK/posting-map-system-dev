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
import { EXECUTION_RUNTIME_PIPELINE_BLUEPRINT, PipelineType, PipelineScope, PipelineStep, PIPELINE_SEQUENCE } from '../../../src/execution/ExecutionRuntimePipeline';
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
function testPipelineStructureAndImmutability() {
  console.log('[Test 1] Pipeline metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_PIPELINE_BLUEPRINT), 'EXECUTION_RUNTIME_PIPELINE_BLUEPRINT container must be frozen');
  
  const pipeline = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getExecutionRuntimePipeline();
  assert(Object.isFrozen(pipeline), 'Pipeline data must be frozen');
  
  const context = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-pipeline-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Pipeline Layer', 'Metadata layer mismatch');

  assert(PipelineType.FOUNDATION === 'FOUNDATION', 'Enum PipelineType check failed');
  assert(PipelineScope.SYSTEM === 'SYSTEM', 'Enum PipelineScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Pipeline Context and Blueprint values checks
function testPipelineBlueprintValues() {
  console.log('[Test 2] Pipeline context and blueprint values validation starting...');

  const pipeline = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getExecutionRuntimePipeline();
  const context = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getData();

  assert(pipeline.id === 'runtime-pipeline-01', 'Pipeline ID mismatch');
  assert(pipeline.context === context, 'Pipeline context mismatch');
  assert(pipeline.data === data, 'Pipeline data mismatch');

  // Verify context holds only runtimePipelineId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Pipeline Context must hold exactly 1 property');
  assert(context.runtimePipelineId === 'runtime-pipeline-01', 'Context runtimePipelineId mismatch');

  // Verify pipeline steps are specified correctly
  assert(data.steps.length === 5, 'Pipeline steps count must be exactly 5');
  assert(data.steps[0] === PipelineStep.BOOT_READY, 'Step 1 mismatch');
  assert(data.steps[1] === PipelineStep.ORCHESTRATION_READY, 'Step 2 mismatch');
  assert(data.steps[2] === PipelineStep.PIPELINE_READY, 'Step 3 mismatch');
  assert(data.steps[3] === PipelineStep.RUNTIME_CONTEXT_READY, 'Step 4 mismatch');
  assert(data.steps[4] === PipelineStep.READY_FOR_RUNTIME, 'Step 5 mismatch');

  // Verify static sequence matches the step array
  const seq = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getPipelineSequence();
  assert(seq === PIPELINE_SEQUENCE, 'Sequence object mismatch');
  assert(Object.isFrozen(seq), 'Sequence array must be frozen');

  // Verify pipeline version
  assert(EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getPipelineVersion() === '1.0', 'Pipeline version mismatch');
  assert(data.pipelineVersion === '1.0', 'Pipeline version mismatch in data');

  console.log('[Test 2] Pipeline context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Pipeline referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const pipe1 = DevelopmentRules.getExecutionRuntimePipeline(rule);
  const pipe2 = DevelopmentRules.getExecutionRuntimePipeline(rule);
  
  assert(pipe1 !== undefined, 'Pipeline should be resolved');
  assert(pipe1 === pipe2, 'Consecutive pipeline resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimePipeline() {
  console.log('[Test 4] Verifying total absence of active pipeline/execution/launcher/plugin APIs...');

  const forbiddenMethods = [
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess',
    'plugin', 'ai', 'shell', 'browser', 'mcp', 'resolve', 'load', 'process', 'pipe', 'next'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_PIPELINE_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_PIPELINE_BLUEPRINT should not contain ${method}`);
    const pipeline = EXECUTION_RUNTIME_PIPELINE_BLUEPRINT.getExecutionRuntimePipeline();
    assert((pipeline as any)[method] === undefined, `ExecutionRuntimePipeline object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active pipeline/execution/launcher/plugin APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const pipeline = DevelopmentRules.getExecutionRuntimePipeline(rule);
  
  assert(pipeline !== undefined, 'getExecutionRuntimePipeline should return a valid result');
  assert(pipeline?.id === 'runtime-pipeline-01', 'Resolved pipeline ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimePipeline(ruleWithoutPipeline) === undefined, 'Rules pipeline resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testPipelineStructureAndImmutability();
    testPipelineBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimePipeline();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Pipeline Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
