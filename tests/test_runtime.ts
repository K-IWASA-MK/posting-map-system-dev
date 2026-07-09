import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../src/aios/SkillRegistry';
import { SkillFactory } from '../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../src/aios/SkillPipelineFactory';
import { RuntimeRegistry, RuntimeState, RuntimeMode } from '../src/aios/RuntimeRegistry';
import { RuntimeFactory } from '../src/aios/RuntimeFactory';
import { RuntimeValidator } from '../src/aios/RuntimeValidator';
import { RuntimeAdapter } from '../src/aios/RuntimeAdapter';
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

  // Register Capability
  const cap = CapabilityFactory.create('Testing', CapabilityCategory.Testing, 'Desc', 10, CapabilityStatus.ACTIVE, '1.0.0');
  CapabilityRegistry.register(cap);

  // Register Skill
  const skill = SkillFactory.create('CodeScan', SkillCategory.Analysis, 'Desc', cap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');
  SkillRegistry.register(skill);

  // Register Pipeline
  const pipeline = SkillPipelineFactory.create('TestPipe', 'Desc', cap.capabilityId, [skill.skillId], 5, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
  SkillPipelineRegistry.register(pipeline);
}

// ==============================================================================
// 1. RuntimeRegistry Metadata and Basic Operations
// ==============================================================================
function testRegistryBasic() {
  console.log('[Test 1] RuntimeRegistry Metadata and Basic Operations verification starting...');
  setupAllEnvironments();

  // Metadata verification
  assert(RuntimeRegistry.metadata.registryId === 'reg-runtime-01', 'Metadata registry ID mismatch');
  assert(RuntimeRegistry.metadata.registryVersion === '1.0.0', 'Metadata registry version mismatch');

  const record = RuntimeFactory.create(
    'test-runtime-env',
    RuntimeState.INITIALIZED,
    RuntimeMode.DEVELOPMENT,
    'A development runtime sandbox',
    ['pipeline-1'],
    '1.0.0'
  );

  assert(record.runtimeId === 'runtime-1', 'Factory failed to assign runtime-1 ID');
  assert(record.runtimeName === 'test-runtime-env', 'runtimeName assignment mismatch');
  assert(record.runtimeState === RuntimeState.INITIALIZED, 'runtimeState assignment mismatch');
  assert(record.runtimeMode === RuntimeMode.DEVELOPMENT, 'runtimeMode assignment mismatch');

  RuntimeRegistry.register(record);
  
  const fetched = RuntimeRegistry.get('runtime-1');
  assert(fetched !== undefined, 'Failed to fetch registered runtime');
  assert(fetched?.runtimeName === 'test-runtime-env', 'Fetched runtime name mismatch');

  // Verify findByPipeline
  const runtimes = RuntimeRegistry.findByPipeline('pipeline-1');
  assert(runtimes.length === 1, 'Should find 1 runtime associated with pipeline-1');
  assert(runtimes[0].runtimeId === 'runtime-1', 'Associated runtime ID mismatch');

  // Verify clear and findAll
  assert(RuntimeRegistry.findAll().length === 1, 'findAll should return 1 record');
  RuntimeRegistry.clear();
  assert(RuntimeRegistry.findAll().length === 0, 'clear should empty the registry');

  console.log('[Test 1] RuntimeRegistry Metadata and Basic Operations verification: PASSED');
}

// ==============================================================================
// 2. Factory and Determinism
// ==============================================================================
function testFactoryDeterminism() {
  console.log('[Test 2] Factory and ID Determinism verification starting...');
  setupAllEnvironments();

  const r1 = RuntimeFactory.create('R1', RuntimeState.INITIALIZED, RuntimeMode.SIMULATION, 'simulation mode', ['pipeline-1']);
  const r2 = RuntimeFactory.create('R2', RuntimeState.RUNNING, RuntimeMode.SIMULATION, 'simulation mode', ['pipeline-1']);
  
  assert(r1.runtimeId === 'runtime-1', 'First ID must be runtime-1');
  assert(r2.runtimeId === 'runtime-2', 'Second ID must be runtime-2');

  // Counter reset verification
  RuntimeFactory.resetCounter();
  const r3 = RuntimeFactory.create('R3', RuntimeState.INITIALIZED, RuntimeMode.SIMULATION, 'simulation mode', ['pipeline-1']);
  assert(r3.runtimeId === 'runtime-1', 'Counter reset failed');

  // Immutability verification
  try {
    (r1 as any).runtimeName = 'ModifiedName';
    assert(false, 'Should throw error when modifying frozen record');
  } catch (e) {
    // OK: Record is frozen
  }

  console.log('[Test 2] Factory and ID Determinism verification: PASSED');
}

// ==============================================================================
// 3. Validator Checks
// ==============================================================================
function testValidator() {
  console.log('[Test 3] RuntimeValidator validation verification starting...');
  setupAllEnvironments();

  const validRecord = RuntimeFactory.create('ValidRuntime', RuntimeState.INITIALIZED, RuntimeMode.DEVELOPMENT, 'Valid desc', ['pipeline-1']);

  // Valid record validation should not throw
  RuntimeValidator.validate(validRecord);

  // 3.1 ID format validation
  try {
    const badId = { ...validRecord, runtimeId: 'bad-id' };
    RuntimeValidator.validate(badId);
    assert(false, 'Should fail validation for invalid runtimeId');
  } catch (e: any) {
    assert(e.message.includes('Invalid runtimeId format'), 'Error message mismatch');
  }

  // 3.2 Empty name validation
  try {
    const badName = { ...validRecord, runtimeName: '   ' };
    RuntimeValidator.validate(badName);
    assert(false, 'Should fail validation for empty runtimeName');
  } catch (e: any) {
    assert(e.message.includes('runtimeName is required'), 'Error message mismatch');
  }

  // 3.3 Invalid state validation
  try {
    const badState = { ...validRecord, runtimeState: 'UNKNOWN_STATE' as any };
    RuntimeValidator.validate(badState);
    assert(false, 'Should fail validation for invalid state');
  } catch (e: any) {
    assert(e.message.includes('Invalid runtimeState'), 'Error message mismatch');
  }

  // 3.4 Invalid mode validation
  try {
    const badMode = { ...validRecord, runtimeMode: 'UNKNOWN_MODE' as any };
    RuntimeValidator.validate(badMode);
    assert(false, 'Should fail validation for invalid mode');
  } catch (e: any) {
    assert(e.message.includes('Invalid runtimeMode'), 'Error message mismatch');
  }

  // 3.5 Pipeline dependency validation
  try {
    const badPipeline = { ...validRecord, supportedPipelineIds: ['pipeline-unregistered'] };
    RuntimeValidator.validate(badPipeline);
    assert(false, 'Should fail validation for unregistered pipeline dependency');
  } catch (e: any) {
    assert(e.message.includes('Pipeline dependency not registered'), 'Error message mismatch');
  }

  // 3.6 Date validation
  try {
    const badDate = { ...validRecord, createdAt: 'not-a-date' };
    RuntimeValidator.validate(badDate);
    assert(false, 'Should fail validation for bad ISO8601 creation date');
  } catch (e: any) {
    assert(e.message.includes('Invalid createdAt ISO8601 format'), 'Error message mismatch');
  }

  // 3.7 Duplicate registration error
  try {
    RuntimeRegistry.register(validRecord);
    // Duplicate registration should throw
    RuntimeRegistry.register(validRecord);
    assert(false, 'Should fail duplicate runtime registration');
  } catch (e: any) {
    assert(e.message.includes('RuntimeRecord ID already registered'), 'Error message mismatch');
  }

  console.log('[Test 3] RuntimeValidator validation verification: PASSED');
}

// ==============================================================================
// 4. RuntimeAdapter and ViewModel conversion
// ==============================================================================
function testAdapterViewModel() {
  console.log('[Test 4] RuntimeAdapter ViewModel conversion verification starting...');
  setupAllEnvironments();

  const record = RuntimeFactory.create(
    'adapter-runtime-env',
    RuntimeState.RUNNING,
    RuntimeMode.PRODUCTION,
    'Production context description',
    ['pipeline-1'],
    '2.1.0'
  );

  const vm = RuntimeAdapter.toViewModel(record);
  
  assert(vm.id === record.runtimeId, 'VM ID mismatch');
  assert(vm.name === 'adapter-runtime-env', 'VM name mismatch');
  assert(vm.stateLabel === 'RUNNING', 'VM state label mismatch');
  assert(vm.modeLabel === 'PRODUCTION', 'VM mode label mismatch');
  assert(vm.descriptionText === 'Production context description', 'VM description mismatch');
  assert(vm.specVersion === '2.1.0', 'VM specVersion mismatch');
  assert(vm.pipelineCount === 1, 'VM pipelineCount mismatch');
  assert(vm.createdTimestamp === record.createdAt, 'VM created timestamp mismatch');

  // Verify immutability of ViewModel
  try {
    (vm as any).name = 'NewVMName';
    assert(false, 'ViewModel must be read-only and frozen');
  } catch (e) {
    // OK: ViewModel is frozen
  }

  console.log('[Test 4] RuntimeAdapter ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  // Create and register runtime environment for pipeline-1
  const record = RuntimeFactory.create(
    'rule-runtime-env',
    RuntimeState.INITIALIZED,
    RuntimeMode.DEVELOPMENT,
    'rules description',
    ['pipeline-1'],
    '1.0.0'
  );
  RuntimeRegistry.register(record);

  // Setup rule mapping to Capability "Testing" -> "pipeline-1" (via setupAllEnvironments)
  const rule = DevelopmentRules.createRule('rule-1', 'Rule testing', 'Testing', 10);

  const runtime = DevelopmentRules.getRuntime(rule);
  assert(runtime !== undefined, 'getRuntime should resolve the associated runtime');
  assert(runtime?.runtimeId === 'runtime-1', 'Resolved runtime ID mismatch');
  assert(runtime?.runtimeName === 'rule-runtime-env', 'Resolved runtime name mismatch');

  // Unregistered Capability/Pipeline test
  CapabilityRegistry.clear();
  const ruleWithoutPipeline = { ...rule };
  assert(DevelopmentRules.getRuntime(ruleWithoutPipeline) === undefined, 'Should return undefined if capability/pipeline is missing');

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
    console.log('\nAll Development Runtime Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
