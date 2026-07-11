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
import { EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT, SessionManagerType, SessionManagerScope, RuntimeSessionType, RUNTIME_SESSION_MODELS } from '../../../src/execution/ExecutionRuntimeSessionManager';
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
function testSessionManagerStructureAndImmutability() {
  console.log('[Test 1] Session Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT), 'EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getExecutionRuntimeSessionManager();
  assert(Object.isFrozen(manager), 'Session Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-session-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Session Manager Layer', 'Metadata layer mismatch');

  assert(SessionManagerType.FOUNDATION === 'FOUNDATION', 'Enum SessionManagerType check failed');
  assert(SessionManagerScope.SYSTEM === 'SYSTEM', 'Enum SessionManagerScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Session Manager Context and Blueprint values checks
function testSessionManagerBlueprintValues() {
  console.log('[Test 2] Session Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getExecutionRuntimeSessionManager();
  const context = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getData();

  assert(manager.id === 'runtime-session-manager-01', 'Session Manager ID mismatch');
  assert(manager.context === context, 'Session Manager context mismatch');
  assert(manager.data === data, 'Session Manager data mismatch');

  // Verify context holds only runtimeSessionManagerId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Session Manager Context must hold exactly 1 property');
  assert(context.runtimeSessionManagerId === 'runtime-session-manager-01', 'Context runtimeSessionManagerId mismatch');

  // Verify sessionModels are specified correctly
  assert(data.sessionModels.length === 5, 'Session models count must be exactly 5');
  assert(data.sessionModels[0].sessionType === RuntimeSessionType.SYSTEM_SESSION, 'Session model 1 mismatch');
  assert(data.sessionModels[1].sessionType === RuntimeSessionType.TENANT_SESSION, 'Session model 2 mismatch');
  assert(data.sessionModels[2].sessionType === RuntimeSessionType.APPLICATION_SESSION, 'Session model 3 mismatch');
  assert(data.sessionModels[3].sessionType === RuntimeSessionType.USER_SESSION, 'Session model 4 mismatch');
  assert(data.sessionModels[4].sessionType === RuntimeSessionType.AGENT_SESSION, 'Session model 5 mismatch');

  // Verify each session model has version 1.0
  assert(data.sessionModels[0].metadata.sessionModelVersion === '1.0', 'Session model 1 version mismatch');
  assert(data.sessionModels[1].metadata.sessionModelVersion === '1.0', 'Session model 2 version mismatch');
  assert(data.sessionModels[2].metadata.sessionModelVersion === '1.0', 'Session model 3 version mismatch');
  assert(data.sessionModels[3].metadata.sessionModelVersion === '1.0', 'Session model 4 version mismatch');
  assert(data.sessionModels[4].metadata.sessionModelVersion === '1.0', 'Session model 5 version mismatch');

  // Verify static session models list matches
  const list = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getSessionModels();
  assert(list === RUNTIME_SESSION_MODELS, 'Session models list object mismatch');
  assert(Object.isFrozen(list), 'Session models list must be frozen');

  console.log('[Test 2] Session Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Session Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeSessionManager(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeSessionManager(rule);
  
  assert(manager1 !== undefined, 'Session Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive session manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeSessionManager() {
  console.log('[Test 4] Verifying total absence of active session manager/execution/launcher/plugin APIs...');

  const forbiddenMethods = [
    'createSession', 'destroySession', 'resumeSession', 'refreshSession', 'syncSession', 'authenticate', 'authorize',
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_SESSION_MANAGER_BLUEPRINT.getExecutionRuntimeSessionManager();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeSessionManager object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active session manager/execution/launcher/plugin APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeSessionManager(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeSessionManager should return a valid result');
  assert(manager?.id === 'runtime-session-manager-01', 'Resolved session manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeSessionManager(ruleWithoutPipeline) === undefined, 'Rules session manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testSessionManagerStructureAndImmutability();
    testSessionManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeSessionManager();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Session Manager Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
