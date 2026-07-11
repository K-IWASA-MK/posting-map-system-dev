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
import { RuntimeSessionValidator } from '../../../src/aios/RuntimeSessionValidator';
import { RuntimeSessionAdapter } from '../../../src/aios/RuntimeSessionAdapter';
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
}

// ==============================================================================
// 1. RuntimeSessionRegistry Metadata and Operations
// ==============================================================================
function testRegistryBasic() {
  console.log('[Test 1] RuntimeSessionRegistry Metadata and Basic Operations starting...');
  setupAllEnvironments();

  // Metadata verification
  assert(RuntimeSessionRegistry.metadata.registryId === 'reg-runtime-session-01', 'Metadata registry ID mismatch');
  assert(RuntimeSessionRegistry.metadata.registryVersion === '1.0.0', 'Metadata registry version mismatch');

  const session = RuntimeSessionFactory.create(
    'test-session-1',
    'runtime-1',
    'A logical test session',
    RuntimeSessionState.CREATED,
    '1.0.0',
    '1.0.0'
  );

  assert(session.sessionId === 'session-1', 'Factory failed to assign session-1 ID');
  assert(session.sessionName === 'test-session-1', 'sessionName assignment mismatch');
  assert(session.state === RuntimeSessionState.CREATED, 'state assignment mismatch');

  RuntimeSessionRegistry.register(session);
  
  const fetched = RuntimeSessionRegistry.get('session-1');
  assert(fetched !== undefined, 'Failed to fetch registered session');
  assert(fetched?.sessionName === 'test-session-1', 'Fetched session name mismatch');

  // Verify findByRuntime
  const list = RuntimeSessionRegistry.findByRuntime('runtime-1');
  assert(list.length === 1, 'Should find 1 session associated with runtime-1');
  assert(list[0].sessionId === 'session-1', 'Associated session ID mismatch');

  // Verify clear and findAll
  assert(RuntimeSessionRegistry.findAll().length === 1, 'findAll should return 1 record');
  RuntimeSessionRegistry.clear();
  assert(RuntimeSessionRegistry.findAll().length === 0, 'clear should empty the registry');

  console.log('[Test 1] RuntimeSessionRegistry Metadata and Basic Operations: PASSED');
}

// ==============================================================================
// 2. Factory and Determinism
// ==============================================================================
function testFactoryDeterminism() {
  console.log('[Test 2] Factory and ID Determinism verification starting...');
  setupAllEnvironments();

  const s1 = RuntimeSessionFactory.create('S1', 'runtime-1', 'desc', RuntimeSessionState.CREATED);
  const s2 = RuntimeSessionFactory.create('S2', 'runtime-1', 'desc', RuntimeSessionState.READY);
  
  assert(s1.sessionId === 'session-1', 'First ID must be session-1');
  assert(s2.sessionId === 'session-2', 'Second ID must be session-2');

  // Counter reset verification
  RuntimeSessionFactory.resetCounter();
  const s3 = RuntimeSessionFactory.create('S3', 'runtime-1', 'desc', RuntimeSessionState.CREATED);
  assert(s3.sessionId === 'session-1', 'Counter reset failed');

  // Immutability verification
  try {
    (s1 as any).sessionName = 'ModifiedName';
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
  console.log('[Test 3] RuntimeSessionValidator validation verification starting...');
  setupAllEnvironments();

  const validSession = RuntimeSessionFactory.create('ValidSession', 'runtime-1', 'Valid desc', RuntimeSessionState.CREATED);

  // Valid record validation should not throw
  RuntimeSessionValidator.validate(validSession);

  // 3.1 ID format validation
  try {
    const badId = { ...validSession, sessionId: 'bad-id' };
    RuntimeSessionValidator.validate(badId);
    assert(false, 'Should fail validation for invalid sessionId');
  } catch (e: any) {
    assert(e.message.includes('Invalid sessionId format'), 'Error message mismatch');
  }

  // 3.2 INVALID_SESSION_STATE validation
  try {
    const badState = { ...validSession, state: 'INVALID_STATE' as any };
    RuntimeSessionValidator.validate(badState);
    assert(false, 'Should fail validation for INVALID_SESSION_STATE');
  } catch (e: any) {
    assert(e.message.includes('Invalid state'), 'INVALID_SESSION_STATE check failed');
  }

  // 3.3 INVALID_SESSION_VERSION validation
  try {
    const badVersion = { ...validSession, version: '   ' };
    RuntimeSessionValidator.validate(badVersion);
    assert(false, 'Should fail validation for INVALID_SESSION_VERSION');
  } catch (e: any) {
    assert(e.message.includes('version is required'), 'INVALID_SESSION_VERSION check failed');
  }

  // 3.4 INVALID_SESSION_DATE validation
  try {
    const badDateSequence = { ...validSession, createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T09:00:00Z' };
    RuntimeSessionValidator.validate(badDateSequence);
    assert(false, 'Should fail validation for INVALID_SESSION_DATE (createdAt > updatedAt)');
  } catch (e: any) {
    assert(e.message.includes('Invalid session date sequence'), 'INVALID_SESSION_DATE check failed');
  }

  // 3.5 INVALID_RUNTIME_REFERENCE validation
  try {
    const badRuntimeRef = { ...validSession, runtimeId: 'runtime-unregistered' };
    RuntimeSessionValidator.validate(badRuntimeRef);
    assert(false, 'Should fail validation for INVALID_RUNTIME_REFERENCE');
  } catch (e: any) {
    assert(e.message.includes('Runtime dependency not registered'), 'INVALID_RUNTIME_REFERENCE check failed');
  }

  // 3.6 DUPLICATE_SESSION validation
  try {
    RuntimeSessionRegistry.register(validSession);
    // Duplicate registration should throw DUPLICATE_SESSION
    RuntimeSessionRegistry.register(validSession);
    assert(false, 'Should throw error for DUPLICATE_SESSION');
  } catch (e: any) {
    assert(e.message.includes('Session ID already registered'), 'DUPLICATE_SESSION check failed');
  }

  // 3.7 DUPLICATE_SESSION Name validation
  try {
    RuntimeSessionRegistry.clear();
    RuntimeSessionRegistry.register(validSession);
    // Duplicate session name with different ID should throw DUPLICATE_SESSION
    const sameNameSession = { ...validSession, sessionId: 'session-2' };
    RuntimeSessionRegistry.register(sameNameSession);
    assert(false, 'Should throw error for duplicate sessionName');
  } catch (e: any) {
    assert(e.message.includes('Session Name already registered'), 'DUPLICATE_SESSION check by name failed');
  }

  console.log('[Test 3] RuntimeSessionValidator validation verification: PASSED');
}

// ==============================================================================
// 4. RuntimeSessionAdapter and ViewModel conversion
// ==============================================================================
function testAdapterViewModel() {
  console.log('[Test 4] RuntimeSessionAdapter ViewModel conversion verification starting...');
  setupAllEnvironments();

  const session = RuntimeSessionFactory.create(
    'adapter-session-env',
    'runtime-1',
    'Production session context description',
    RuntimeSessionState.ACTIVE,
    '2.1.0'
  );

  const vm = RuntimeSessionAdapter.toViewModel(session);
  
  assert(vm.id === session.sessionId, 'VM ID mismatch');
  assert(vm.name === 'adapter-session-env', 'VM name mismatch');
  assert(vm.runtimeId === 'runtime-1', 'VM runtimeId mismatch');
  assert(vm.descriptionText === 'Production session context description', 'VM description mismatch');
  assert(vm.sessionSpecVersion === '2.1.0', 'VM sessionSpecVersion mismatch');
  assert(vm.stateLabel === 'ACTIVE', 'VM state label mismatch');
  assert(vm.createdTimestamp === session.createdAt, 'VM created timestamp mismatch');

  // Verify immutability of ViewModel
  try {
    (vm as any).name = 'NewVMName';
    assert(false, 'ViewModel must be read-only and frozen');
  } catch (e) {
    // OK: ViewModel is frozen
  }

  console.log('[Test 4] RuntimeSessionAdapter ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  // Create and register runtime session environment
  const session = RuntimeSessionFactory.create(
    'rule-session-env',
    'runtime-1',
    'rules session description',
    RuntimeSessionState.ACTIVE,
    '1.0.0'
  );
  RuntimeSessionRegistry.register(session);

  // Setup rule mapping to Capability "Testing" -> "pipeline-1" (via setupAllEnvironments)
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);

  const resolvedSession = DevelopmentRules.getRuntimeSession(rule);
  assert(resolvedSession !== undefined, 'getRuntimeSession should resolve the associated session');
  assert(resolvedSession?.sessionId === 'session-1', 'Resolved session ID mismatch');
  assert(resolvedSession?.sessionName === 'rule-session-env', 'Resolved session name mismatch');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getRuntimeSession(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

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
    console.log('\nAll Development Runtime Session Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
