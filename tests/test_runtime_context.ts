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
import { RuntimeContextValidator } from '../src/aios/RuntimeContextValidator';
import { RuntimeContextAdapter } from '../src/aios/RuntimeContextAdapter';
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
}

// ==============================================================================
// 1. RuntimeContextRegistry Metadata and Operations
// ==============================================================================
function testRegistryBasic() {
  console.log('[Test 1] RuntimeContextRegistry Metadata and Basic Operations starting...');
  setupAllEnvironments();

  // Metadata verification
  assert(RuntimeContextRegistry.metadata.registryId === 'reg-runtime-context-01', 'Metadata registry ID mismatch');
  assert(RuntimeContextRegistry.metadata.registryVersion === '1.0.0', 'Metadata registry version mismatch');

  const context = RuntimeContextFactory.create(
    'test-context-1',
    'session-1',
    'A logical test context',
    RuntimeContextState.CREATED,
    '1.0.0',
    '1.0.0'
  );

  assert(context.contextId === 'context-1', 'Factory failed to assign context-1 ID');
  assert(context.contextName === 'test-context-1', 'contextName assignment mismatch');
  assert(context.state === RuntimeContextState.CREATED, 'state assignment mismatch');

  RuntimeContextRegistry.register(context);
  
  const fetched = RuntimeContextRegistry.get('context-1');
  assert(fetched !== undefined, 'Failed to fetch registered context');
  assert(fetched?.contextName === 'test-context-1', 'Fetched context name mismatch');

  // Verify findBySession
  const list = RuntimeContextRegistry.findBySession('session-1');
  assert(list.length === 1, 'Should find 1 context associated with session-1');
  assert(list[0].contextId === 'context-1', 'Associated context ID mismatch');

  // Verify clear and findAll
  assert(RuntimeContextRegistry.findAll().length === 1, 'findAll should return 1 record');
  RuntimeContextRegistry.clear();
  assert(RuntimeContextRegistry.findAll().length === 0, 'clear should empty the registry');

  console.log('[Test 1] RuntimeContextRegistry Metadata and Basic Operations: PASSED');
}

// ==============================================================================
// 2. Factory and Determinism
// ==============================================================================
function testFactoryDeterminism() {
  console.log('[Test 2] Factory and ID Determinism verification starting...');
  setupAllEnvironments();

  const c1 = RuntimeContextFactory.create('C1', 'session-1', 'desc', RuntimeContextState.CREATED);
  const c2 = RuntimeContextFactory.create('C2', 'session-1', 'desc', RuntimeContextState.INITIALIZED);
  
  assert(c1.contextId === 'context-1', 'First ID must be context-1');
  assert(c2.contextId === 'context-2', 'Second ID must be context-2');

  // Counter reset verification
  RuntimeContextFactory.resetCounter();
  const c3 = RuntimeContextFactory.create('C3', 'session-1', 'desc', RuntimeContextState.CREATED);
  assert(c3.contextId === 'context-1', 'Counter reset failed');

  // Immutability verification
  try {
    (c1 as any).contextName = 'ModifiedName';
    assert(false, 'Should throw error when modifying frozen record');
  } catch (e) {
    // OK: Record is frozen
  }

  console.log('[Test 2] Factory and ID Determinism verification: PASSED');
}

// ==============================================================================
// 3. Validator Checks (with exact error mapping from Flash instructions)
// ==============================================================================
function testValidator() {
  console.log('[Test 3] RuntimeContextValidator validation verification starting...');
  setupAllEnvironments();

  const validContext = RuntimeContextFactory.create('ValidContext', 'session-1', 'Valid desc', RuntimeContextState.CREATED);

  // Valid record validation should not throw
  RuntimeContextValidator.validate(validContext);

  // 3.1 ID format validation
  try {
    const badId = { ...validContext, contextId: 'bad-id' };
    RuntimeContextValidator.validate(badId);
    assert(false, 'Should fail validation for invalid contextId');
  } catch (e: any) {
    assert(e.message.includes('Invalid contextId format'), 'Error message mismatch');
  }

  // 3.2 INVALID_CONTEXT_STATE validation
  try {
    const badState = { ...validContext, state: 'INVALID_STATE' as any };
    RuntimeContextValidator.validate(badState);
    assert(false, 'Should fail validation for INVALID_CONTEXT_STATE');
  } catch (e: any) {
    assert(e.message.includes('Invalid state'), 'INVALID_CONTEXT_STATE check failed');
  }

  // 3.3 INVALID_CONTEXT_VERSION validation
  try {
    const badVersion = { ...validContext, version: '   ' };
    RuntimeContextValidator.validate(badVersion);
    assert(false, 'Should fail validation for INVALID_CONTEXT_VERSION');
  } catch (e: any) {
    assert(e.message.includes('version is required'), 'INVALID_CONTEXT_VERSION check failed');
  }

  // 3.4 INVALID_CONTEXT_DATE validation
  try {
    const badDateSequence = { ...validContext, createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T09:00:00Z' };
    RuntimeContextValidator.validate(badDateSequence);
    assert(false, 'Should fail validation for INVALID_CONTEXT_DATE (createdAt > updatedAt)');
  } catch (e: any) {
    assert(e.message.includes('Invalid context date sequence'), 'INVALID_CONTEXT_DATE check failed');
  }

  // 3.5 INVALID_SESSION_REFERENCE validation
  try {
    const badSessionRef = { ...validContext, sessionId: 'session-unregistered' };
    RuntimeContextValidator.validate(badSessionRef);
    assert(false, 'Should fail validation for INVALID_SESSION_REFERENCE');
  } catch (e: any) {
    assert(e.message.includes('Session dependency not registered'), 'INVALID_SESSION_REFERENCE check failed');
  }

  // 3.6 DUPLICATE_CONTEXT validation
  try {
    RuntimeContextRegistry.register(validContext);
    // Duplicate registration should throw DUPLICATE_CONTEXT
    RuntimeContextRegistry.register(validContext);
    assert(false, 'Should throw error for DUPLICATE_CONTEXT');
  } catch (e: any) {
    assert(e.message.includes('Context ID already registered'), 'DUPLICATE_CONTEXT check failed');
  }

  // 3.7 DUPLICATE_CONTEXT Name validation
  try {
    RuntimeContextRegistry.clear();
    RuntimeContextRegistry.register(validContext);
    // Duplicate context name with different ID should throw DUPLICATE_CONTEXT
    const sameNameContext = { ...validContext, contextId: 'context-2' };
    RuntimeContextRegistry.register(sameNameContext);
    assert(false, 'Should throw error for duplicate contextName');
  } catch (e: any) {
    assert(e.message.includes('Context Name already registered'), 'DUPLICATE_CONTEXT check by name failed');
  }

  console.log('[Test 3] RuntimeContextValidator validation verification: PASSED');
}

// ==============================================================================
// 4. RuntimeContextAdapter and ViewModel conversion
// ==============================================================================
function testAdapterViewModel() {
  console.log('[Test 4] RuntimeContextAdapter ViewModel conversion verification starting...');
  setupAllEnvironments();

  const context = RuntimeContextFactory.create(
    'adapter-context-env',
    'session-1',
    'Production context description',
    RuntimeContextState.ACTIVE,
    '2.1.0'
  );

  const vm = RuntimeContextAdapter.toViewModel(context);
  
  assert(vm.id === context.contextId, 'VM ID mismatch');
  assert(vm.name === 'adapter-context-env', 'VM name mismatch');
  assert(vm.sessionId === 'session-1', 'VM sessionId mismatch');
  assert(vm.descriptionText === 'Production context description', 'VM description mismatch');
  assert(vm.contextSpecVersion === '2.1.0', 'VM contextSpecVersion mismatch');
  assert(vm.stateLabel === 'ACTIVE', 'VM state label mismatch');
  assert(vm.displayName === 'Context: adapter-context-env (context-1)', 'VM displayName mismatch');
  assert(vm.createdTimestamp === context.createdAt, 'VM created timestamp mismatch');

  // Verify immutability of ViewModel
  try {
    (vm as any).name = 'NewVMName';
    assert(false, 'ViewModel must be read-only and frozen');
  } catch (e) {
    // OK: ViewModel is frozen
  }

  console.log('[Test 4] RuntimeContextAdapter ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  // Create and register runtime context environment
  const context = RuntimeContextFactory.create(
    'rule-context-env',
    'session-1',
    'rules context description',
    RuntimeContextState.ACTIVE,
    '1.0.0'
  );
  RuntimeContextRegistry.register(context);

  // Setup rule mapping to Capability "Testing" -> "pipeline-1" (via setupAllEnvironments)
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);

  const resolvedContext = DevelopmentRules.getRuntimeContext(rule);
  assert(resolvedContext !== undefined, 'getRuntimeContext should resolve the associated context');
  assert(resolvedContext?.contextId === 'context-1', 'Resolved context ID mismatch');
  assert(resolvedContext?.contextName === 'rule-context-env', 'Resolved context name mismatch');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getRuntimeContext(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

  console.log('[Test 5] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testRegistryBasic();
    testFactoryDeterminism();
    testValidator();
    testAdapterViewModel();
    testRulesIntegration();
    console.log('\nAll Development Runtime Context tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
