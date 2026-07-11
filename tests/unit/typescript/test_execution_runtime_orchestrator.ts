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
import { EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT, OrchestratorType, OrchestratorScope, OrchestratorStep, ORCHESTRATION_SEQUENCE } from '../../../src/execution/ExecutionRuntimeOrchestrator';
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
function testOrchestratorStructureAndImmutability() {
  console.log('[Test 1] Orchestrator metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT), 'EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT container must be frozen');
  
  const orchestrator = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getExecutionRuntimeOrchestrator();
  assert(Object.isFrozen(orchestrator), 'Orchestrator data must be frozen');
  
  const context = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-orchestrator-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Orchestrator Layer', 'Metadata layer mismatch');

  assert(OrchestratorType.FOUNDATION === 'FOUNDATION', 'Enum OrchestratorType check failed');
  assert(OrchestratorScope.SYSTEM === 'SYSTEM', 'Enum OrchestratorScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Orchestrator Context and Blueprint values checks
function testOrchestratorBlueprintValues() {
  console.log('[Test 2] Orchestrator context and blueprint values validation starting...');

  const orchestrator = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getExecutionRuntimeOrchestrator();
  const context = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getData();

  assert(orchestrator.id === 'runtime-orchestrator-01', 'Orchestrator ID mismatch');
  assert(orchestrator.context === context, 'Orchestrator context mismatch');
  assert(orchestrator.data === data, 'Orchestrator data mismatch');

  // Verify context holds only runtimeOrchestratorId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Orchestrator Context must hold exactly 1 property');
  assert(context.runtimeOrchestratorId === 'runtime-orchestrator-01', 'Context runtimeOrchestratorId mismatch');

  // Verify orchestration steps are specified correctly
  assert(data.steps.length === 7, 'Orchestration steps count must be exactly 7');
  assert(data.steps[0] === OrchestratorStep.BOOT_SEQUENCE, 'Step 1 mismatch');
  assert(data.steps[1] === OrchestratorStep.LOAD_ENGINE, 'Step 2 mismatch');
  assert(data.steps[2] === OrchestratorStep.LOAD_SERVICE, 'Step 3 mismatch');
  assert(data.steps[3] === OrchestratorStep.LOAD_COMPONENT, 'Step 4 mismatch');
  assert(data.steps[4] === OrchestratorStep.LOAD_LIFECYCLE, 'Step 5 mismatch');
  assert(data.steps[5] === OrchestratorStep.BUILD_RUNTIME_CONTEXT, 'Step 6 mismatch');
  assert(data.steps[6] === OrchestratorStep.READY_FOR_EXECUTION, 'Step 7 mismatch');

  // Verify static sequence matches the step array
  const seq = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getOrchestrationSequence();
  assert(seq === ORCHESTRATION_SEQUENCE, 'Sequence object mismatch');
  assert(Object.isFrozen(seq), 'Sequence array must be frozen');

  console.log('[Test 2] Orchestrator context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Orchestrator referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const orch1 = DevelopmentRules.getExecutionRuntimeOrchestrator(rule);
  const orch2 = DevelopmentRules.getExecutionRuntimeOrchestrator(rule);
  
  assert(orch1 !== undefined, 'Orchestrator should be resolved');
  assert(orch1 === orch2, 'Consecutive orchestrator resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeOrchestration() {
  console.log('[Test 4] Verifying total absence of active orchestration/execution/launcher/plugin APIs...');

  const forbiddenMethods = [
    'orchestrate', 'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess',
    'plugin', 'ai', 'shell', 'browser', 'mcp', 'resolve', 'load'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT should not contain ${method}`);
    const orchestrator = EXECUTION_RUNTIME_ORCHESTRATOR_BLUEPRINT.getExecutionRuntimeOrchestrator();
    assert((orchestrator as any)[method] === undefined, `ExecutionRuntimeOrchestrator object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active orchestration/execution/launcher/plugin APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const orchestrator = DevelopmentRules.getExecutionRuntimeOrchestrator(rule);
  
  assert(orchestrator !== undefined, 'getExecutionRuntimeOrchestrator should return a valid result');
  assert(orchestrator?.id === 'runtime-orchestrator-01', 'Resolved orchestrator ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeOrchestrator(ruleWithoutPipeline) === undefined, 'Rules orchestrator resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testOrchestratorStructureAndImmutability();
    testOrchestratorBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeOrchestration();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Orchestrator Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
