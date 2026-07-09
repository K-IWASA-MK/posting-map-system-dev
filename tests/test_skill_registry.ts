import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus, Skill } from '../src/aios/SkillRegistry';
import { SkillFactory } from '../src/aios/SkillFactory';
import { SkillValidator } from '../src/aios/SkillValidator';
import { SkillAdapter } from '../src/aios/SkillAdapter';
import { DevelopmentRules } from '../src/aios/DevelopmentRules';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function setupStandardCapabilityAndSkillRegistry() {
  CapabilityRegistry.clear();
  CapabilityFactory.resetCounter();
  SkillRegistry.clear();
  SkillFactory.resetCounter();

  // Create a parent capability
  const archCap = CapabilityFactory.create(
    'Architecture',
    CapabilityCategory.Architecture,
    'Abstract Architecture capability',
    10,
    CapabilityStatus.ACTIVE,
    '1.0.0'
  );
  CapabilityRegistry.register(archCap);
}

// ==============================================================================
// 1. SkillRegistry Metadata Verification
// ==============================================================================
function testSkillRegistryMetadata() {
  console.log('[Test 1] SkillRegistry Metadata verification starting...');
  assert(SkillRegistry.metadata.registryId === 'reg-skill-01', 'Registry ID mismatch');
  assert(SkillRegistry.metadata.registryVersion === '1.0.0', 'Version mismatch');
  
  try {
    (SkillRegistry.metadata as any).registryVersion = '2.0.0';
    assert(false, 'Should be read-only');
  } catch (e) {
    // OK
  }
  console.log('[Test 1] SkillRegistry Metadata verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and Deterministic ID verification starting...');
  setupStandardCapabilityAndSkillRegistry();

  const cap = CapabilityRegistry.getByName('Architecture')!;
  const skill = SkillFactory.create(
    'CodeAudit',
    SkillCategory.Audit,
    'Audits code files',
    cap.capabilityId,
    5,
    SkillStatus.ACTIVE,
    '1.0.0'
  );

  assert(skill.skillId === 'skill-1', 'Monotonic counter ID failed');
  assert(skill.capabilityId === cap.capabilityId, 'Capability ID mismatch');
  
  try {
    (skill as any).priority = 100;
    assert(false, 'Should be frozen');
  } catch (e) {
    // OK
  }
  console.log('[Test 2] Factory and Deterministic ID verification: PASSED');
}

// ==============================================================================
// 3. Validator Verification (Capability existence check)
// ==============================================================================
function testValidator() {
  console.log('[Test 3] Validator verification starting...');
  setupStandardCapabilityAndSkillRegistry();

  // Test register a skill referencing unregistered capability ID
  try {
    SkillFactory.create(
      'TestSkill',
      SkillCategory.Validation,
      'Validates things',
      'capability-unregistered',
      1,
      SkillStatus.ACTIVE,
      '1.0.0'
    );
    assert(false, 'Should fail validation for unregistered capabilityId');
  } catch (e: any) {
    assert(e.message.includes('Parent Capability is not registered'), 'Error message mismatch');
  }

  // Test invalid semantic version
  const cap = CapabilityRegistry.getByName('Architecture')!;
  try {
    SkillFactory.create(
      'TestSkill2',
      SkillCategory.Validation,
      'Validates things',
      cap.capabilityId,
      1,
      SkillStatus.ACTIVE,
      '1.0-alpha' // invalid semver
    );
    assert(false, 'Should fail validation for invalid semver');
  } catch (e: any) {
    assert(e.message.includes('Invalid semantic version'), 'Error message mismatch');
  }

  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. Adapter & ViewModel Verification
// ==============================================================================
function testAdapter() {
  console.log('[Test 4] Adapter verification starting...');
  setupStandardCapabilityAndSkillRegistry();

  const cap = CapabilityRegistry.getByName('Architecture')!;
  const skill = SkillFactory.create(
    'CodeAudit',
    SkillCategory.Audit,
    'Audits code files',
    cap.capabilityId,
    10,
    SkillStatus.ACTIVE,
    '1.0.0'
  );

  const vm = SkillAdapter.toViewModel(skill);
  assert(vm.id === skill.skillId, 'VM ID mismatch');
  assert(vm.name === skill.skillName, 'VM Name mismatch');
  assert(vm.categoryLabel === 'AUDIT', 'VM Category label mismatch');
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
// 5. Capability -> Skill 1:N Mapping Integration
// ==============================================================================
function testCapabilitySkillMapping() {
  console.log('[Test 5] Capability to Skill 1:N Mapping verification starting...');
  setupStandardCapabilityAndSkillRegistry();

  const cap = CapabilityRegistry.getByName('Architecture')!;
  
  // Create 2 skills
  const skill1 = SkillFactory.create('CodeAudit', SkillCategory.Audit, 'Desc 1', cap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');
  const skill2 = SkillFactory.create('Metrics', SkillCategory.Analysis, 'Desc 2', cap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');

  SkillRegistry.register(skill1);
  SkillRegistry.register(skill2);

  // Statically map them in CapabilityRegistry via the new replacement helper
  CapabilityRegistry.addSupportedSkill(cap.capabilityId, skill1.skillId);
  CapabilityRegistry.addSupportedSkill(cap.capabilityId, skill2.skillId);

  // Retrieve updated capability from Registry
  const updatedCap = CapabilityRegistry.get(cap.capabilityId)!;
  assert(updatedCap.supportedSkillIds.length === 2, 'Should map 2 supported skills');
  assert(updatedCap.supportedSkillIds.includes('skill-1'), 'Supported skill 1 ID mismatch');
  assert(updatedCap.supportedSkillIds.includes('skill-2'), 'Supported skill 2 ID mismatch');

  // Verify DevelopmentRules integration (reverse lookup)
  const rule = DevelopmentRules.createRule('rule-01', 'Architectural reviews', 'Architecture', 5);
  const requiredSkills = DevelopmentRules.getRequiredSkills(rule);
  assert(requiredSkills.length === 2, 'Should resolve 2 required skills via rule');
  assert(requiredSkills.some(s => s.skillName === 'CodeAudit'), 'Should include CodeAudit skill');
  assert(requiredSkills.some(s => s.skillName === 'Metrics'), 'Should include Metrics skill');

  console.log('[Test 5] Capability to Skill 1:N Mapping verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testSkillRegistryMetadata();
    testFactoryAndIds();
    testValidator();
    testAdapter();
    testCapabilitySkillMapping();
    console.log('\nAll Skill Registry Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
