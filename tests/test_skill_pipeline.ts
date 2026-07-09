import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../src/aios/SkillRegistry';
import { SkillFactory } from '../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus, SkillPipeline } from '../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../src/aios/SkillPipelineFactory';
import { SkillPipelineValidator } from '../src/aios/SkillPipelineValidator';
import { SkillPipelineAdapter } from '../src/aios/SkillPipelineAdapter';
import { DevelopmentRules } from '../src/aios/DevelopmentRules';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function setupEnvironments() {
  CapabilityRegistry.clear();
  CapabilityFactory.resetCounter();
  SkillRegistry.clear();
  SkillFactory.resetCounter();
  SkillPipelineRegistry.clear();
  SkillPipelineFactory.resetCounter();

  // 1. Parent Capability
  const devCap = CapabilityFactory.create(
    'Implementation',
    CapabilityCategory.Implementation,
    'Abstract Implementation capability',
    10,
    CapabilityStatus.ACTIVE,
    '1.0.0'
  );
  CapabilityRegistry.register(devCap);

  // 2. Skills
  const scanSkill = SkillFactory.create('CodeScan', SkillCategory.Analysis, 'Scan files', devCap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');
  const fixSkill = SkillFactory.create('CodeFix', SkillCategory.Transformation, 'Fix files', devCap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');
  const docSkill = SkillFactory.create('CodeDoc', SkillCategory.Documentation, 'Doc files', devCap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');

  SkillRegistry.register(scanSkill);
  SkillRegistry.register(fixSkill);
  SkillRegistry.register(docSkill);
}

// ==============================================================================
// 1. Metadata Verification
// ==============================================================================
function testMetadata() {
  console.log('[Test 1] Metadata verification starting...');
  assert(SkillPipelineRegistry.metadata.registryId === 'reg-pipeline-01', 'Registry ID mismatch');
  assert(SkillPipelineRegistry.metadata.registryVersion === '1.0.0', 'Version mismatch');
  console.log('[Test 1] Metadata verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and Deterministic ID verification starting...');
  setupEnvironments();

  const devCap = CapabilityRegistry.getByName('Implementation')!;
  const pipeline = SkillPipelineFactory.create(
    'AutoRefactorFlow',
    'Refactoring pipeline',
    devCap.capabilityId,
    ['skill-1', 'skill-2', 'skill-3'], // Analysis -> Transformation -> Documentation
    10,
    SkillPipelineStatus.ACTIVE,
    '1.0.0',
    '1.0.0'
  );

  assert(pipeline.pipelineId === 'pipeline-1', 'Monotonic counter ID failed');
  assert(pipeline.skillIds.length === 3, 'Skill IDs list length mismatch');
  
  try {
    (pipeline as any).priority = 100;
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
  setupEnvironments();
  const devCap = CapabilityRegistry.getByName('Implementation')!;

  // Verify missing capability ID
  try {
    SkillPipelineFactory.create('BadPipe', 'Desc', 'capability-unregistered', ['skill-1'], 1, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
    assert(false, 'Should fail validation for unregistered capabilityId');
  } catch (e: any) {
    assert(e.message.includes('Capability not registered'), 'Error message mismatch');
  }

  // Verify missing skill ID
  try {
    SkillPipelineFactory.create('BadPipe2', 'Desc', devCap.capabilityId, ['skill-unregistered'], 1, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
    assert(false, 'Should fail validation for unregistered skillId');
  } catch (e: any) {
    assert(e.message.includes('Skill not registered'), 'Error message mismatch');
  }

  // Verify ordering (Analysis -> Transformation -> Documentation is valid)
  const okPipeline = SkillPipelineFactory.create('OkPipe', 'Desc', devCap.capabilityId, ['skill-1', 'skill-2', 'skill-3'], 1, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
  assert(okPipeline !== undefined, 'OK Pipeline creation failed');

  // Verify INVALID_PIPELINE_ORDER (Transformation before Analysis)
  try {
    SkillPipelineFactory.create('OutOfOrderPipe', 'Desc', devCap.capabilityId, ['skill-2', 'skill-1'], 1, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
    assert(false, 'Should fail validation for out of order skills');
  } catch (e: any) {
    assert(e.message.includes('INVALID_PIPELINE_ORDER'), 'Should throw INVALID_PIPELINE_ORDER error');
  }

  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. Adapter & ViewModel Verification
// ==============================================================================
function testAdapter() {
  console.log('[Test 4] Adapter verification starting...');
  setupEnvironments();
  const devCap = CapabilityRegistry.getByName('Implementation')!;

  const pipeline = SkillPipelineFactory.create(
    'AutoRefactorFlow',
    'Refactoring pipeline',
    devCap.capabilityId,
    ['skill-1', 'skill-2'],
    10,
    SkillPipelineStatus.ACTIVE,
    '1.0.0',
    '1.0.0'
  );

  const vm = SkillPipelineAdapter.toViewModel(pipeline);
  assert(vm.id === pipeline.pipelineId, 'VM ID mismatch');
  assert(vm.name === pipeline.pipelineName, 'VM Name mismatch');
  assert(vm.priorityLabel === 'HIGH', 'Priority label mismatch');
  assert(vm.isAvailable === true, 'Availability mapping failed');
  assert(vm.versionTag === 'v1.0.0', 'Version tag mapping failed');
  assert(vm.formattedTimeline === 'skill-1 ➔ skill-2', 'Timeline formatting failed');

  try {
    (vm as any).priorityLabel = 'LOW';
    assert(false, 'VM should be frozen');
  } catch (e) {
    // OK
  }
  console.log('[Test 4] Adapter verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupEnvironments();
  const devCap = CapabilityRegistry.getByName('Implementation')!;

  const pipeline = SkillPipelineFactory.create(
    'AutoRefactorFlow',
    'Refactoring pipeline',
    devCap.capabilityId,
    ['skill-1', 'skill-2'],
    10,
    SkillPipelineStatus.ACTIVE,
    '1.0.0',
    '1.0.0'
  );
  SkillPipelineRegistry.register(pipeline);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Implementation', 5);
  const resolvedPipe = DevelopmentRules.getRequiredPipeline(rule);

  assert(resolvedPipe !== undefined, 'Should resolve pipeline from capability name');
  assert(resolvedPipe?.pipelineId === pipeline.pipelineId, 'Resolved pipeline ID mismatch');

  console.log('[Test 5] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testMetadata();
    testFactoryAndIds();
    testValidator();
    testAdapter();
    testRulesIntegration();
    console.log('\nAll Skill Pipeline Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
