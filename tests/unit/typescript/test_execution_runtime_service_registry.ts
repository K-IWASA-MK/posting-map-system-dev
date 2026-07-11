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
import { EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT, ServiceRegistryType } from '../../../src/execution/ExecutionRuntimeServiceRegistry';
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
function testRegistryStructureAndImmutability() {
  console.log('[Test 1] Registry metadata, entries, and registry structures check starting...');
  
  assert(Object.isFrozen(EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT), 'EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT container must be frozen');
  
  const registry = EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT.getRegistry();
  assert(Object.isFrozen(registry), 'Registry data must be frozen');
  
  const entries = EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT.getEntries();
  assert(Object.isFrozen(entries), 'Entries array must be frozen');
  
  const metadata = EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT.getMetadata();
  assert(Object.isFrozen(metadata), 'Metadata must be frozen');
  
  assert(metadata.author === 'AIOS Team', 'Metadata author mismatch');
  assert(metadata.version === '1.0.0', 'Metadata version mismatch');
  assert(metadata.phase === 'Phase 207-2', 'Metadata phase mismatch');

  assert(ServiceRegistryType.FOUNDATION === 'FOUNDATION', 'Enum ServiceRegistryType check failed');
  assert(ServiceRegistryType.RUNTIME === 'RUNTIME', 'Enum ServiceRegistryType check failed');
  assert(ServiceRegistryType.SIMULATION === 'SIMULATION', 'Enum ServiceRegistryType check failed');
  assert(ServiceRegistryType.PLUGIN === 'PLUGIN', 'Enum ServiceRegistryType check failed');
  assert(ServiceRegistryType.AI === 'AI', 'Enum ServiceRegistryType check failed');

  console.log('[Test 1] Structure and Immutability check: PASSED');
}

// 2. Registry Entries hold only basic metadata (No direct Service object references)
function testRegistryObjectReadOnlyConstraints() {
  console.log('[Test 2] Registry read-only and static constraints checking (No direct Service objects)...');

  const entries = EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT.getEntries();
  assert(entries.length === 1, 'Registry must have 1 entry');
  
  const entry = entries[0];
  assert(Object.isFrozen(entry), 'Registry entry must be frozen');

  assert(entry.serviceId === 'runtime-service-01', 'Entry serviceId mismatch');
  assert(entry.serviceType === 'FOUNDATION', 'Entry serviceType mismatch');
  assert(entry.name === 'Foundation Execution Runtime Service', 'Entry name mismatch');
  assert(entry.description === 'The foundation static execution runtime service', 'Entry description mismatch');

  // Verify entry has no object fields
  const keys = Object.keys(entry);
  assert(keys.length === 4, 'Entry must only have 4 properties');
  assert(keys.includes('serviceId'), 'Must contain serviceId');
  assert(keys.includes('serviceType'), 'Must contain serviceType');
  assert(keys.includes('name'), 'Must contain name');
  assert(keys.includes('description'), 'Must contain description');

  for (const key of keys) {
    assert(typeof (entry as any)[key] === 'string', `Property ${key} must be string`);
  }

  console.log('[Test 2] Registry read-only and static constraints checking: PASSED');
}

// 3. Referential Determinism verification
function testReferentialDeterminism() {
  console.log('[Test 3] Registry referential determinism checks starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const reg1 = DevelopmentRules.getExecutionRuntimeServiceRegistry(rule);
  const reg2 = DevelopmentRules.getExecutionRuntimeServiceRegistry(rule);
  
  assert(reg1 !== undefined, 'Registry should be resolved');
  assert(reg1 === reg2, 'Consecutive registry calls on the same rule must return the exact same frozen reference');

  console.log('[Test 3] Referential determinism checks: PASSED');
}

// 4. Verification that active registry methods are absent
function testAbsenceOfRuntimeServiceRegistryOperations() {
  console.log('[Test 4] Verifying total absence of active execution/registry/loader APIs...');

  const forbiddenMethods = [
    'register', 'unregister', 'load', 'reload', 'lookup', 'resolve', 'create', 'destroy', 'execute', 'run', 'start'
  ];

  for (const method of forbiddenMethods) {
    assert((EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT as any)[method] === undefined, `EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT should not contain ${method}`);
    const registry = EXECUTION_RUNTIME_SERVICE_REGISTRY_BLUEPRINT.getRegistry();
    assert((registry as any)[method] === undefined, `ExecutionRuntimeServiceRegistry object should not contain ${method}`);
  }

  console.log('[Test 4] Total absence of active execution/registry/loader APIs: PASSED');
}

// 5. DevelopmentRules Static Mapping integration verification
function testDevelopmentRulesIntegration() {
  console.log('[Test 5] DevelopmentRules static integration check starting...');
  setupAllEnvironments();

  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);
  const registry = DevelopmentRules.getExecutionRuntimeServiceRegistry(rule);
  
  assert(registry !== undefined, 'getExecutionRuntimeServiceRegistry should return a valid result');
  assert(registry?.id === 'runtime-service-registry-01', 'Resolved registry ID mismatch in rules resolver');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getExecutionRuntimeServiceRegistry(ruleWithoutPipeline) === undefined, 'Rules registry should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules static integration check: PASSED');
}

// Main Runner
function runAllTests() {
  try {
    testRegistryStructureAndImmutability();
    testRegistryObjectReadOnlyConstraints();
    testReferentialDeterminism();
    testAbsenceOfRuntimeServiceRegistryOperations();
    testDevelopmentRulesIntegration();
    console.log('\nAll Execution Runtime Service Registry Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
