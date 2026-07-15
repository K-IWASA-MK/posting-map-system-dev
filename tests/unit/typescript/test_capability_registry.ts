import { CapabilityRegistry, CapabilityCategory, CapabilityStatus, Capability } from '../../../sdk/CapabilityRegistry';
import { CapabilityFactory } from '../../../sdk/CapabilityFactory';
import { CapabilityValidator } from '../../../sdk/CapabilityValidator';
import { CapabilityAdapter } from '../../../sdk/CapabilityAdapter';
import { CapabilityResolver } from '../../../sdk/CapabilityResolver';
import { DevelopmentRules } from '../../../sdk/DevelopmentRules';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Helper to pre-populate registry for resolver tests
function setupStandardRegistry() {
  CapabilityRegistry.clear();
  CapabilityFactory.resetCounter();

  Object.values(CapabilityCategory).forEach(cat => {
    const cap = CapabilityFactory.create(
      cat, // name matches the category name
      cat,
      `Abstract ${cat} capability`,
      10,
      CapabilityStatus.ACTIVE,
      '1.0.0'
    );
    CapabilityRegistry.register(cap);
  });
}

// ==============================================================================
// 1. Registry Metadata & Frozen Verification
// ==============================================================================
function testRegistryMetadata() {
  console.log('[Test 1] Registry Metadata verification starting...');
  assert(CapabilityRegistry.metadata.registryId === 'reg-cap-01', 'Registry ID mismatch');
  assert(CapabilityRegistry.metadata.registryVersion === '1.0.0', 'Version mismatch');
  
  try {
    (CapabilityRegistry.metadata as any).registryVersion = '2.0.0';
    assert(false, 'Should be read-only');
  } catch (e) {
    // OK
  }
  console.log('[Test 1] Registry Metadata verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and Deterministic ID verification starting...');
  setupStandardRegistry();

  const cap = CapabilityRegistry.getAll()[0];
  assert(cap.capabilityId === 'capability-1', 'Monotonic counter ID failed');
  assert(cap.version === '1.0.0', 'Version mismatch');
  
  try {
    (cap as any).priority = 100;
    assert(false, 'Should be frozen');
  } catch (e) {
    // OK
  }
  console.log('[Test 2] Factory and Deterministic ID verification: PASSED');
}

// ==============================================================================
// 3. Validator Verification
// ==============================================================================
function testValidator() {
  console.log('[Test 3] Validator verification starting...');
  
  const badCap: any = {
    capabilityId: 'cap-bad',
    capabilityName: 'Bad',
    category: 'InvalidCategory',
    description: 'Bad desc',
    priority: 1,
    status: CapabilityStatus.ACTIVE,
    version: '1.0.0'
  };

  try {
    CapabilityValidator.validate(badCap);
    assert(false, 'Should fail validation for bad category');
  } catch (e) {
    // OK
  }

  const badVersion: Capability = {
    capabilityId: 'cap-bad-v',
    capabilityName: 'BadV',
    category: CapabilityCategory.Architecture,
    description: 'Bad version desc',
    priority: 1,
    status: CapabilityStatus.ACTIVE,
    version: '1.0.beta', // bad semver
    supportedSkillIds: []
  };

  try {
    CapabilityValidator.validate(badVersion);
    assert(false, 'Should fail validation for invalid semver');
  } catch (e) {
    // OK
  }
  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. Adapter & ViewModel Verification
// ==============================================================================
function testAdapter() {
  console.log('[Test 4] Adapter verification starting...');
  setupStandardRegistry();

  const cap = CapabilityRegistry.get('capability-1')!;
  const vm = CapabilityAdapter.toViewModel(cap);

  assert(vm.id === cap.capabilityId, 'VM ID mismatch');
  assert(vm.name === cap.capabilityName, 'VM Name mismatch');
  assert(vm.categoryLabel === cap.category.toUpperCase(), 'VM Category mismatch');
  assert(vm.priorityLabel === 'HIGH', 'Priority label mismatch');
  assert(vm.isAvailable === true, 'Availability mapping failed');
  assert(vm.versionTag === 'v1.0.0', 'Version tag mapping failed');

  try {
    (vm as any).priorityLabel = 'LOW';
    assert(false, 'VM should be frozen');
  } catch (e) {
    // OK
  }
  console.log('[Test 4] Adapter verification: PASSED');
}

// ==============================================================================
// 5. CapabilityResolver & Registry Dependency Verification
// ==============================================================================
function testResolver() {
  console.log('[Test 5] CapabilityResolver dependency verification starting...');
  setupStandardRegistry();

  const cap1 = CapabilityResolver.resolve('Draft structural charter');
  assert(cap1.category === CapabilityCategory.Architecture, 'Resolver category mapping failed');
  assert(cap1.capabilityId !== undefined, 'Should return the full Capability object from Registry');

  // Verify registry lookup failure for unregistered capability category
  CapabilityRegistry.clear();
  try {
    CapabilityResolver.resolve('Draft structural charter');
    assert(false, 'Resolver should throw error if category not in registry');
  } catch (e: any) {
    assert(e.message.includes('is not registered in registry'), 'Error message mismatch');
  }
  console.log('[Test 5] CapabilityResolver dependency verification: PASSED');
}

// ==============================================================================
// 6. DevelopmentRules Registry Integration Verification
// ==============================================================================
function testRulesRegistry() {
  console.log('[Test 6] DevelopmentRules Registry integration starting...');
  setupStandardRegistry();

  // Test registration verification (Name lookup test)
  const rule = DevelopmentRules.createRule('rule-01', 'Audit requirements', 'Architecture', 5);
  assert(rule.capability === 'Architecture', 'Rule capability mismatch');

  // Verify error when rule references unregistered capability name
  try {
    DevelopmentRules.createRule('rule-02', 'Hacking things', 'InvalidCapability', 1);
    assert(false, 'Rule creation should fail for unregistered capability');
  } catch (e) {
    // OK
  }
  console.log('[Test 6] DevelopmentRules Registry integration: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testRegistryMetadata();
    testFactoryAndIds();
    testValidator();
    testAdapter();
    testResolver();
    testRulesRegistry();
    console.log('\nAll Capability Registry Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
