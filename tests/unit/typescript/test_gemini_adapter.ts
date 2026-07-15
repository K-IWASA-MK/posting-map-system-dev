import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/CapabilityRegistry';
import { CapabilityFactory } from '../../../sdk/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../sdk/SkillRegistry';
import { SkillFactory } from '../../../sdk/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../sdk/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../../../sdk/SkillPipelineFactory';
import { ToolRegistry } from '../../../sdk/ToolRegistry';
import { GeminiModelRegistry, GeminiProvider, GeminiModelStatus } from '../../../sdk/GeminiModelRegistry';
import { GeminiAdapterRegistry } from '../../../sdk/GeminiAdapter';
import { ToolAdapterStatus } from '../../../sdk/ToolAdapter';
import { GeminiAdapterFactory } from '../../../sdk/GeminiAdapterFactory';
import { GeminiAdapterAdapter } from '../../../sdk/GeminiAdapterAdapter';
import { DevelopmentRules } from '../../../sdk/DevelopmentRules';

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
  ToolRegistry.clear(); // Pre-populates tool-antigravity, tool-claude, and tool-gemini
  GeminiModelRegistry.clear();
  GeminiAdapterRegistry.clear();
  GeminiAdapterFactory.resetCounter();

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
// 1. GeminiModelRegistry Verification
// ==============================================================================
function testModelRegistry() {
  console.log('[Test 1] GeminiModelRegistry verification starting...');
  setupAllEnvironments();

  // Verify Registry Metadata
  assert(GeminiModelRegistry.metadata.registryId === 'reg-gemini-model-01', 'Metadata registry ID mismatch');
  assert(GeminiModelRegistry.metadata.registryVersion === '1.0.0', 'Metadata version mismatch');

  const model = GeminiModelRegistry.createModel(
    'gemini-model-001',
    'gemini-2.5-pro',
    GeminiProvider.GOOGLE_AI,
    '1.0.0',
    'Google Gemini model',
    GeminiModelStatus.ACTIVE
  );

  assert(model.modelId === 'gemini-model-001', 'modelId assignment failed');
  assert(model.provider === GeminiProvider.GOOGLE_AI, 'Provider assignment failed');
  assert(model.status === GeminiModelStatus.ACTIVE, 'Status assignment failed');

  GeminiModelRegistry.register(model);
  const fetched = GeminiModelRegistry.get('gemini-model-001')!;
  assert(fetched.modelName === 'gemini-2.5-pro', 'Retrieve failed');

  // Verify ID validation
  try {
    GeminiModelRegistry.createModel('bad-id', 'test', GeminiProvider.GOOGLE_AI, '1.0.0', 'Desc', GeminiModelStatus.ACTIVE);
    assert(false, 'Should throw error for bad modelId');
  } catch (e: any) {
    assert(e.message.includes('Invalid modelId'), 'Error message mismatch');
  }

  // Verify duplicate name rejection
  try {
    const dupe = GeminiModelRegistry.createModel('gemini-model-002', 'gemini-2.5-pro', GeminiProvider.GOOGLE_AI, '1.0.0', 'Dupe', GeminiModelStatus.ACTIVE);
    GeminiModelRegistry.register(dupe);
    assert(false, 'Should throw error for duplicate modelName');
  } catch (e: any) {
    assert(e.message.includes('Model Name already registered'), 'Error message mismatch');
  }

  console.log('[Test 1] GeminiModelRegistry verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and ID verification starting...');
  setupAllEnvironments();

  const model = GeminiModelRegistry.createModel('gemini-model-001', 'gemini-2.5-pro', GeminiProvider.GOOGLE_AI, '1.0.0', 'Desc', GeminiModelStatus.ACTIVE);
  GeminiModelRegistry.register(model);

  const adapter = GeminiAdapterFactory.create(
    'GeminiAdapterMain',
    'Main Gemini Adapter',
    ['pipeline-1'],
    ['tool-gemini'],
    ['gemini-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  assert(adapter.adapterId === 'adapter-1', 'Monotonic counter failed');
  assert(adapter.supportedModelIds[0] === 'gemini-model-001', 'Model mapping mismatch');

  try {
    (adapter as any).adapterName = 'Mutated';
    assert(false, 'Should be frozen');
  } catch (e) {
    // OK
  }
  console.log('[Test 2] Factory and ID verification: PASSED');
}

// ==============================================================================
// 3. Validator Verification (SSOT dependencies)
// ==============================================================================
function testValidator() {
  console.log('[Test 3] Validator verification starting...');
  setupAllEnvironments();

  const model = GeminiModelRegistry.createModel('gemini-model-001', 'gemini-2.5-pro', GeminiProvider.GOOGLE_AI, '1.0.0', 'Desc', GeminiModelStatus.ACTIVE);
  GeminiModelRegistry.register(model);

  // 3.1 Unregistered modelId dependency check
  try {
    const badAdapter = GeminiAdapterFactory.create(
      'BadAdapter',
      'Desc',
      ['pipeline-1'],
      ['tool-gemini'],
      ['gemini-model-unregistered'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    GeminiAdapterRegistry.register(badAdapter);
    assert(false, 'Should fail validation for unregistered modelId');
  } catch (e: any) {
    assert(e.message.includes('Model dependency not registered'), 'Error message mismatch');
  }

  // 3.2 Unregistered tool dependency check
  try {
    const badAdapter = GeminiAdapterFactory.create(
      'BadAdapter2',
      'Desc',
      ['pipeline-1'],
      ['tool-unregistered'],
      ['gemini-model-001'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    GeminiAdapterRegistry.register(badAdapter);
    assert(false, 'Should fail validation for unregistered toolId');
  } catch (e: any) {
    assert(e.message.includes('Tool dependency not registered'), 'Error message mismatch');
  }

  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. ViewModel Transformation
// ==============================================================================
function testViewModel() {
  console.log('[Test 4] ViewModel conversion verification starting...');
  setupAllEnvironments();

  const model = GeminiModelRegistry.createModel('gemini-model-001', 'gemini-2.5-pro', GeminiProvider.GOOGLE_AI, '1.0.0', 'Desc', GeminiModelStatus.ACTIVE);
  GeminiModelRegistry.register(model);

  const adapter = GeminiAdapterFactory.create(
    'GeminiAdapterMain',
    'Main Gemini Adapter',
    ['pipeline-1'],
    ['tool-gemini'],
    ['gemini-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  const vm = GeminiAdapterAdapter.toViewModel(adapter);
  assert(vm.id === adapter.adapterId, 'VM ID mismatch');
  assert(vm.name === 'GeminiAdapterMain', 'VM name mismatch');
  assert(vm.modelCount === 1, 'VM model count mismatch');
  assert(vm.statusLabel === 'ACTIVE', 'VM status label mismatch');

  try {
    (vm as any).modelCount = 10;
    assert(false, 'VM should be frozen');
  } catch (e) {
    // OK
  }

  console.log('[Test 4] ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification (4-layer resolution)
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  const model = GeminiModelRegistry.createModel('gemini-model-001', 'gemini-2.5-pro', GeminiProvider.GOOGLE_AI, '1.0.0', 'Desc', GeminiModelStatus.ACTIVE);
  GeminiModelRegistry.register(model);

  const adapter = GeminiAdapterFactory.create(
    'GeminiAdapterMain',
    'Main Gemini Adapter',
    ['pipeline-1'],
    ['tool-gemini'],
    ['gemini-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );
  GeminiAdapterRegistry.register(adapter);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  
  // 1. Get GeminiAdapter via rule
  const resolvedAdapter = DevelopmentRules.getGeminiAdapter(rule);
  assert(resolvedAdapter !== undefined, 'Should resolve GeminiAdapter via rule');
  assert(resolvedAdapter?.adapterId === adapter.adapterId, 'Resolved adapter ID mismatch');

  // 2. Resolve GeminiModels via rule (4-layer resolution)
  const resolvedModels = DevelopmentRules.getGeminiModels(rule);
  assert(resolvedModels.length === 1, 'Should resolve 1 GeminiModel');
  assert(resolvedModels[0].modelId === 'gemini-model-001', 'Resolved model ID mismatch');
  assert(resolvedModels[0].provider === GeminiProvider.GOOGLE_AI, 'Resolved provider mismatch');

  console.log('[Test 5] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testModelRegistry();
    testFactoryAndIds();
    testValidator();
    testViewModel();
    testRulesIntegration();
    console.log('\nAll Gemini Adapter Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
