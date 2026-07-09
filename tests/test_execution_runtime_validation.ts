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
import { EXECUTION_RUNTIME_VALIDATION_LOGIC, ValidationStatus } from '../src/execution/ExecutionRuntimeValidation';
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
function testValidationStructureAndImmutability() {
  console.log('[Test 1] Validation metadata and result structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_VALIDATION_LOGIC), 'EXECUTION_RUNTIME_VALIDATION_LOGIC container must be frozen');
  
  const metadata = EXECUTION_RUNTIME_VALIDATION_LOGIC.getValidationMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 205-3', 'Metadata phase mismatch');

  assert(ValidationStatus.VALID === 'VALID', 'Enum ValidationStatus check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Validation resolve result validation
function testValidationLogicExecutionAndReadonly() {
  console.log('[Test 2] Validation logic execution and result validation starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const result = EXECUTION_RUNTIME_VALIDATION_LOGIC.validateRuntime(rule);

  assert(result !== undefined, 'Validation result should be resolved');
  assert(Object.isFrozen(result), 'Returned validation result must be frozen');

  assert(result?.runtimeManagerId === 'runtime-manager-01', 'Manager ID mismatch');
  assert(result?.runtimeSessionId === 'runtime-session-01', 'Session ID mismatch');
  assert(result?.runtimeContextId === 'runtime-context-01', 'Context ID mismatch');
  assert(result?.runtimeRegistryId === 'registry-runtime-01', 'Registry ID mismatch');
  assert(result?.runtimeResolverId === 'runtime-resolver-01', 'Resolver ID mismatch');
  assert(result?.hydratorId === 'context-hydrator-01', 'Hydrator ID mismatch');
  assert(result?.validatorId === 'blueprint-validator-01', 'Validator ID mismatch');
  assert(result?.validationStatus === ValidationStatus.VALID, 'Validation status mismatch');

  console.log('[Test 2] Validation logic execution and result validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Validation referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const v1 = EXECUTION_RUNTIME_VALIDATION_LOGIC.validateRuntime(rule);
  const v2 = EXECUTION_RUNTIME_VALIDATION_LOGIC.validateRuntime(rule);
  
  assert(v1 === v2, 'Consecutive validation calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeLogicExecution() {
  console.log('[Test 4] Verifying total absence of active execution/repair/control APIs...');

  const forbiddenMethods = [
    'execute', 'dispatch', 'repair', 'recover', 'update', 'bind',
    'schedule', 'queue', 'ai', 'shell', 'browser', 'mcp'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_VALIDATION_LOGIC as any)[method] === undefined, `EXECUTION_RUNTIME_VALIDATION_LOGIC should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active runtime execution/repair APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const result = DevelopmentRules.getExecutionRuntimeValidationLogic(rule);
  
  assert(result !== undefined, 'getExecutionRuntimeValidationLogic should return a valid result');
  assert(result?.validatorId === 'blueprint-validator-01', 'Resolved validator ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeValidationLogic(ruleWithoutPipeline) === undefined, 'Rules validator should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testValidationStructureAndImmutability();
    testValidationLogicExecutionAndReadonly();
    testReferentialDeterminism();
    testAbsenceOfRuntimeLogicExecution();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Validation Logic Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
