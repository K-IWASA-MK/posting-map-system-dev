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
import { EXECUTION_RUNTIME_LOADER_BLUEPRINT, LoaderManagerType, LoaderManagerScope, RuntimeLoadingType, RUNTIME_LOADING_MODELS } from '../../../src/execution/ExecutionRuntimeLoader';
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
function testLoaderManagerStructureAndImmutability() {
  console.log('[Test 1] Loader Manager metadata, context, and data structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_LOADER_BLUEPRINT), 'EXECUTION_RUNTIME_LOADER_BLUEPRINT container must be frozen');
  
  const manager = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getExecutionRuntimeLoader();
  assert(Object.isFrozen(manager), 'Loader Manager data must be frozen');
  
  const context = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getContext();
  assert(Object.isFrozen(context), 'Context must be frozen');
  
  const metadata = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  const data = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getData();
  assert(Object.isFrozen(data), 'Data must be frozen');

  assert(metadata.id === 'runtime-loader-manager-meta-01', 'Metadata id mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.layer === 'Loader Manager Layer', 'Metadata layer mismatch');

  assert(LoaderManagerType.FOUNDATION === 'FOUNDATION', 'Enum LoaderManagerType check failed');
  assert(LoaderManagerScope.SYSTEM === 'SYSTEM', 'Enum LoaderManagerScope check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Loader Manager Context and Blueprint values checks
function testLoaderManagerBlueprintValues() {
  console.log('[Test 2] Loader Manager context and blueprint values validation starting...');

  const manager = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getExecutionRuntimeLoader();
  const context = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getContext();
  const data = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getData();

  assert(manager.id === 'runtime-loader-01', 'Loader Manager ID mismatch');
  assert(manager.context === context, 'Loader Manager context mismatch');
  assert(manager.data === data, 'Loader Manager data mismatch');

  // Verify context holds only runtimeLoaderId (simple context check)
  const contextKeys = Object.keys(context);
  assert(contextKeys.length === 1, 'Loader Manager Context must hold exactly 1 property');
  assert(context.runtimeLoaderId === 'runtime-loader-01', 'Context runtimeLoaderId mismatch');

  // Verify loadingModels are specified correctly
  assert(data.loadingModels.length === 5, 'Loading models count must be exactly 5');
  assert(data.loadingModels[0].loadingType === RuntimeLoadingType.SYSTEM_LOAD, 'Loading model 1 mismatch');
  assert(data.loadingModels[1].loadingType === RuntimeLoadingType.ENGINE_LOAD, 'Loading model 2 mismatch');
  assert(data.loadingModels[2].loadingType === RuntimeLoadingType.SERVICE_LOAD, 'Loading model 3 mismatch');
  assert(data.loadingModels[3].loadingType === RuntimeLoadingType.COMPONENT_LOAD, 'Loading model 4 mismatch');
  assert(data.loadingModels[4].loadingType === RuntimeLoadingType.APPLICATION_LOAD, 'Loading model 5 mismatch');

  // Verify each loading model has version 1.0 and correct loadOrder
  assert(data.loadingModels[0].metadata.loadingModelVersion === '1.0', 'Loading model 1 version mismatch');
  assert(data.loadingModels[0].loadOrder === 1, 'Loading model 1 order mismatch');

  assert(data.loadingModels[1].metadata.loadingModelVersion === '1.0', 'Loading model 2 version mismatch');
  assert(data.loadingModels[1].loadOrder === 2, 'Loading model 2 order mismatch');

  assert(data.loadingModels[2].metadata.loadingModelVersion === '1.0', 'Loading model 3 version mismatch');
  assert(data.loadingModels[2].loadOrder === 3, 'Loading model 3 order mismatch');

  assert(data.loadingModels[3].metadata.loadingModelVersion === '1.0', 'Loading model 4 version mismatch');
  assert(data.loadingModels[3].loadOrder === 4, 'Loading model 4 order mismatch');

  assert(data.loadingModels[4].metadata.loadingModelVersion === '1.0', 'Loading model 5 version mismatch');
  assert(data.loadingModels[4].loadOrder === 5, 'Loading model 5 order mismatch');

  // Verify static loading models list matches
  const list = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getLoadingModels();
  assert(list === RUNTIME_LOADING_MODELS, 'Loading models list object mismatch');
  assert(Object.isFrozen(list), 'Loading models list must be frozen');

  console.log('[Test 2] Loader Manager context and blueprint values validation: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Loader Manager referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager1 = DevelopmentRules.getExecutionRuntimeLoader(rule);
  const manager2 = DevelopmentRules.getExecutionRuntimeLoader(rule);
  
  assert(manager1 !== undefined, 'Loader Manager should be resolved');
  assert(manager1 === manager2, 'Consecutive loader manager resolver calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active runtime methods are absent
function testAbsenceOfRuntimeLoaderManager() {
  console.log('[Test 4] Verifying total absence of active loader manager/execution/launcher/plugin/memory/mount/resolve/initialize/load/preload APIs...');

  const forbiddenMethods = [
    'load', 'preload', 'initialize', 'mount', 'resolve', 'resolveDependencies', 'createInstance',
    'execute', 'run', 'start', 'stop', 'restart', 'dispatch', 'schedule', 'spawn', 'fork', 'createProcess'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_LOADER_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_LOADER_BLUEPRINT should not contain ${method}`);
    const manager = EXECUTION_RUNTIME_LOADER_BLUEPRINT.getExecutionRuntimeLoader();
    assert((manager as any)[method] === undefined, `ExecutionRuntimeLoader object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active loader manager/execution/launcher/plugin/memory/mount/resolve/initialize/load/preload APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const manager = DevelopmentRules.getExecutionRuntimeLoader(rule);
  
  assert(manager !== undefined, 'getExecutionRuntimeLoader should return a valid result');
  assert(manager?.id === 'runtime-loader-01', 'Resolved loader manager ID mismatch in rules resolver');

  // Unregistered Capability test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeLoader(ruleWithoutPipeline) === undefined, 'Rules loader manager resolver should return undefined if capability is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testLoaderManagerStructureAndImmutability();
    testLoaderManagerBlueprintValues();
    testReferentialDeterminism();
    testAbsenceOfRuntimeLoaderManager();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Loader Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
