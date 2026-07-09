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
import { RequestType, EXECUTION_REQUEST_BLUEPRINT } from '../src/execution/ExecutionRequest';
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

// ==============================================================================
// 1. RequestType and Enum verification
// ==============================================================================
function testRequestTypes() {
  console.log('[Test 1] RequestType Enum values verification starting...');
  assert(RequestType.FOUNDATION === 'FOUNDATION', 'FOUNDATION enum mismatch');
  assert(RequestType.RUNTIME === 'RUNTIME', 'RUNTIME enum mismatch');
  assert(RequestType.SIMULATION === 'SIMULATION', 'SIMULATION enum mismatch');
  assert(RequestType.PLUGIN === 'PLUGIN', 'PLUGIN enum mismatch');
  assert(RequestType.AI === 'AI', 'AI enum mismatch');
  console.log('[Test 1] RequestType Enum values verification: PASSED');
}

// ==============================================================================
// 2. Blueprint structure and multi-layer Object.isFrozen immutability verification
// ==============================================================================
function testRequestStructureAndImmutability() {
  console.log('[Test 2] ExecutionRequestBlueprint structure and immutability verification starting...');
  
  // Immutability checks on blueprint container itself
  assert(Object.isFrozen(EXECUTION_REQUEST_BLUEPRINT), 'EXECUTION_REQUEST_BLUEPRINT itself must be frozen');
  
  const request = EXECUTION_REQUEST_BLUEPRINT.getRequest();
  
  // Request Model Freeze
  assert(Object.isFrozen(request), 'getRequest() result must be frozen');
  
  // Context Freeze
  assert(Object.isFrozen(request.context), 'Request context must be frozen');
  
  // Metadata Freeze
  assert(Object.isFrozen(request.metadata), 'Request metadata must be frozen');

  // Verify properties
  assert(request.id === 'execution-request-01', 'Request ID mismatch');
  assert(request.name === 'Default Execution Request', 'Request Name mismatch');
  assert(request.requestType === RequestType.FOUNDATION, 'Request Type mismatch');
  
  // Context property checks
  const context = request.context;
  assert(context.capability === 'Testing', 'Context capability mismatch');
  assert(context.pipeline === 'TestPipe', 'Context pipeline mismatch');
  assert(context.runtime === 'runtime-1', 'Context runtime mismatch');
  assert(context.executionEngine === 'engine-execution-01', 'Context executionEngine mismatch');
  assert(context.executionRegistry === 'registry-execution-01', 'Context executionRegistry mismatch');
  
  const metadata = EXECUTION_REQUEST_BLUEPRINT.getMetadata();
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.phase === 'Phase 203-3', 'Metadata phase mismatch');

  console.log('[Test 2] ExecutionRequestBlueprint structure and immutability verification: PASSED');
}

// ==============================================================================
// 3. Blueprint Getter APIs & declarative only validation
// ==============================================================================
function testRequestGettersAndDeclarativeOnly() {
  console.log('[Test 3] Request Getter APIs and declarative logic checks starting...');
  
  const context = EXECUTION_REQUEST_BLUEPRINT.getContext();
  const metadata = EXECUTION_REQUEST_BLUEPRINT.getMetadata();
  const request = EXECUTION_REQUEST_BLUEPRINT.getRequest();

  assert(context !== undefined, 'getContext failed');
  assert(metadata !== undefined, 'getMetadata failed');
  assert(request !== undefined, 'getRequest failed');

  // Assert absence of dynamic manipulation and execution methods on request model
  assert((request as any).validate === undefined, 'No validate method should exist on ExecutionRequest model');
  assert((request as any).dispatch === undefined, 'No dispatch method should exist on ExecutionRequest model');
  assert((request as any).execute === undefined, 'No execute method should exist on ExecutionRequest model');
  assert((request as any).enqueue === undefined, 'No enqueue method should exist on ExecutionRequest model');
  assert((request as any).send === undefined, 'No send method should exist on ExecutionRequest model');
  assert((request as any).retry === undefined, 'No retry method should exist on ExecutionRequest model');
  assert((request as any).cancel === undefined, 'No cancel method should exist on ExecutionRequest model');

  // Assert absence of dynamic manipulation and execution methods on blueprint container
  assert((EXECUTION_REQUEST_BLUEPRINT as any).validate === undefined, 'No validate method should exist on blueprint container');
  assert((EXECUTION_REQUEST_BLUEPRINT as any).dispatch === undefined, 'No dispatch method should exist on blueprint container');
  assert((EXECUTION_REQUEST_BLUEPRINT as any).execute === undefined, 'No execute method should exist on blueprint container');
  assert((EXECUTION_REQUEST_BLUEPRINT as any).enqueue === undefined, 'No enqueue method should exist on blueprint container');
  assert((EXECUTION_REQUEST_BLUEPRINT as any).send === undefined, 'No send method should exist on blueprint container');
  assert((EXECUTION_REQUEST_BLUEPRINT as any).retry === undefined, 'No retry method should exist on blueprint container');
  assert((EXECUTION_REQUEST_BLUEPRINT as any).cancel === undefined, 'No cancel method should exist on blueprint container');

  console.log('[Test 3] Request Getter APIs and declarative logic checks: PASSED');
}

// ==============================================================================
// 4. Deterministic Reference verification
// ==============================================================================
function testReferenceDeterminism() {
  console.log('[Test 4] Request referential determinism checks starting...');
  
  const r1 = EXECUTION_REQUEST_BLUEPRINT.getRequest();
  const r2 = EXECUTION_REQUEST_BLUEPRINT.getRequest();
  assert(r1 === r2, 'getRequest() must return the exact same frozen reference');

  const c1 = EXECUTION_REQUEST_BLUEPRINT.getContext();
  const c2 = EXECUTION_REQUEST_BLUEPRINT.getContext();
  assert(c1 === c2, 'getContext() must return the exact same frozen reference');

  const m1 = EXECUTION_REQUEST_BLUEPRINT.getMetadata();
  const m2 = EXECUTION_REQUEST_BLUEPRINT.getMetadata();
  assert(m1 === m2, 'getMetadata() must return the exact same frozen reference');

  console.log('[Test 4] Request referential determinism checks: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static mapping integration verification starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  
  const request = DevelopmentRules.getExecutionRequest(rule);
  assert(request !== undefined, 'getExecutionRequest should resolve statically');
  assert(request?.id === 'execution-request-01', 'Resolved request ID mismatch');
  assert(request?.requestType === RequestType.FOUNDATION, 'Resolved request type mismatch');

  // Consecutive resolutions return exact same reference (Static Resolution guarantee)
  const request2 = DevelopmentRules.getExecutionRequest(rule);
  assert(request === request2, 'Resolution must return the exact same static instance');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRequest(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static mapping integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testRequestTypes();
    testRequestStructureAndImmutability();
    testRequestGettersAndDeclarativeOnly();
    testReferenceDeterminism();
    testRulesIntegration();
    console.log('\nAll Execution Request Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
