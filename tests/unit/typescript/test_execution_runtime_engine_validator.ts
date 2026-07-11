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
import { EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT, EngineValidatorType } from '../../../src/execution/ExecutionRuntimeEngineValidator';
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
function testValidatorStructureAndImmutability() {
  console.log('[Test 1] Validator metadata, context, and validator structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT), 'EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT container must be frozen');
  
  const validator = EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT.getValidator();
  assert(Object.isFrozen(validator), 'Validator data must be frozen');
  
  const context = EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 206-4', 'Metadata phase mismatch');

  assert(EngineValidatorType.FOUNDATION === 'FOUNDATION', 'Enum EngineValidatorType check failed');
  assert(EngineValidatorType.RUNTIME === 'RUNTIME', 'Enum EngineValidatorType check failed');
  assert(EngineValidatorType.SIMULATION === 'SIMULATION', 'Enum EngineValidatorType check failed');
  assert(EngineValidatorType.PLUGIN === 'PLUGIN', 'Enum EngineValidatorType check failed');
  assert(EngineValidatorType.AI === 'AI', 'Enum EngineValidatorType check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Validator Context holds only IDs (No direct Engine, Registry, or Resolver objects)
function testValidatorObjectReadOnlyConstraints() {
  console.log('[Test 2] Validator read-only and static constraints checking (No direct Engine/Registry/Resolver objects)...');

  const context = EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT.getContext();

  assert(context.runtimeEngineId === 'runtime-engine-01', 'Context runtimeEngineId mismatch');
  assert(context.runtimeEngineRegistryId === 'runtime-engine-registry-01', 'Context runtimeEngineRegistryId mismatch');
  assert(context.runtimeEngineResolverId === 'runtime-engine-resolver-01', 'Context runtimeEngineResolverId mismatch');
  assert(context.runtimeManagerId === 'runtime-manager-01', 'Context runtimeManagerId mismatch');
  assert(context.runtimeSessionId === 'runtime-session-01', 'Context runtimeSessionId mismatch');
  assert(context.runtimeContextId === 'runtime-context-01', 'Context runtimeContextId mismatch');

  // Verify context holds only IDs and has no object fields
  const keys = Object.keys(context);
  assert(keys.length === 6, 'Context must only have 6 properties');
  assert(keys.includes('runtimeEngineId'), 'Must contain runtimeEngineId');
  assert(keys.includes('runtimeEngineRegistryId'), 'Must contain runtimeEngineRegistryId');
  assert(keys.includes('runtimeEngineResolverId'), 'Must contain runtimeEngineResolverId');
  assert(keys.includes('runtimeManagerId'), 'Must contain runtimeManagerId');
  assert(keys.includes('runtimeSessionId'), 'Must contain runtimeSessionId');
  assert(keys.includes('runtimeContextId'), 'Must contain runtimeContextId');

  for (const key of keys) {
    assert(typeof (context as any)[key] === 'string', `Property ${key} must be string`);
  }

  console.log('[Test 2] Validator read-only and static constraints checking: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Validator referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const val1 = DevelopmentRules.getExecutionRuntimeEngineValidator(rule);
  const val2 = DevelopmentRules.getExecutionRuntimeEngineValidator(rule);
  
  assert(val1 !== undefined, 'Validator should be resolved');
  assert(val1 === val2, 'Consecutive validator calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime/validation/management methods are absent
function testAbsenceOfRuntimeEngineValidatorOperations() {
  console.log('[Test 4] Verifying total absence of active execution/validation/loader APIs...');

  const forbiddenMethods = [
    'validate', 'verify', 'check', 'repair', 'recover', 'execute', 'run', 'start', 'stop', 'resolve', 'cache', 'instantiate'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT should not contain ${method}`);
    const validator = EXECUTION_RUNTIME_ENGINE_VALIDATOR_BLUEPRINT.getValidator();
    assert((validator as any)[method] === undefined, `ExecutionRuntimeEngineValidator object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active execution/validation/loader APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const validator = DevelopmentRules.getExecutionRuntimeEngineValidator(rule);
  
  assert(validator !== undefined, 'getExecutionRuntimeEngineValidator should return a valid result');
  assert(validator?.id === 'runtime-engine-validator-01', 'Resolved validator ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeEngineValidator(ruleWithoutPipeline) === undefined, 'Rules validator should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testValidatorStructureAndImmutability();
    testValidatorObjectReadOnlyConstraints();
    testReferentialDeterminism();
    testAbsenceOfRuntimeEngineValidatorOperations();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Engine Validator Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
