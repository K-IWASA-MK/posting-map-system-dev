import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../../../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../src/aios/SkillRegistry';
import { SkillFactory } from '../../../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../../../src/aios/SkillPipelineFactory';
import { ToolRegistry } from '../../../src/aios/ToolRegistry';
import { OpenAIModelRegistry, OpenAIProvider, OpenAIModelStatus } from '../../../src/aios/OpenAIModelRegistry';
import { OpenAIAdapterRegistry } from '../../../src/aios/OpenAIAdapter';
import { ToolAdapterStatus } from '../../../src/aios/ToolAdapter';
import { OpenAIAdapterFactory } from '../../../src/aios/OpenAIAdapterFactory';
import { OpenAIAdapterAdapter } from '../../../src/aios/OpenAIAdapterAdapter';
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
  ToolRegistry.clear(); // Pre-populates all tools (including tool-openai)
  OpenAIModelRegistry.clear();
  OpenAIAdapterRegistry.clear();
  OpenAIAdapterFactory.resetCounter();

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
// 1. OpenAIModelRegistry Verification
// ==============================================================================
function testModelRegistry() {
  console.log('[Test 1] OpenAIModelRegistry verification starting...');
  setupAllEnvironments();

  // Verify Registry Metadata
  assert(OpenAIModelRegistry.metadata.registryId === 'reg-openai-model-01', 'Metadata registry ID mismatch');
  assert(OpenAIModelRegistry.metadata.registryVersion === '1.0.0', 'Metadata version mismatch');

  const model = OpenAIModelRegistry.createModel(
    'openai-model-001',
    'gpt-4o',
    OpenAIProvider.OPENAI,
    '1.0.0',
    'OpenAI GPT-4o model',
    OpenAIModelStatus.ACTIVE
  );

  assert(model.modelId === 'openai-model-001', 'modelId assignment failed');
  assert(model.provider === OpenAIProvider.OPENAI, 'Provider assignment failed');
  assert(model.status === OpenAIModelStatus.ACTIVE, 'Status assignment failed');

  OpenAIModelRegistry.register(model);
  const fetched = OpenAIModelRegistry.get('openai-model-001')!;
  assert(fetched.modelName === 'gpt-4o', 'Retrieve failed');

  // Verify ID validation
  try {
    OpenAIModelRegistry.createModel('bad-id', 'test', OpenAIProvider.OPENAI, '1.0.0', 'Desc', OpenAIModelStatus.ACTIVE);
    assert(false, 'Should throw error for bad modelId');
  } catch (e: any) {
    assert(e.message.includes('Invalid modelId'), 'Error message mismatch');
  }

  // Verify duplicate name rejection
  try {
    const dupe = OpenAIModelRegistry.createModel('openai-model-002', 'gpt-4o', OpenAIProvider.OPENAI, '1.0.0', 'Dupe', OpenAIModelStatus.ACTIVE);
    OpenAIModelRegistry.register(dupe);
    assert(false, 'Should throw error for duplicate modelName');
  } catch (e: any) {
    assert(e.message.includes('Model Name already registered'), 'Error message mismatch');
  }

  console.log('[Test 1] OpenAIModelRegistry verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and ID verification starting...');
  setupAllEnvironments();

  const model = OpenAIModelRegistry.createModel('openai-model-001', 'gpt-4o', OpenAIProvider.OPENAI, '1.0.0', 'Desc', OpenAIModelStatus.ACTIVE);
  OpenAIModelRegistry.register(model);

  const adapter = OpenAIAdapterFactory.create(
    'OpenAIAdapterMain',
    'Main OpenAI Adapter',
    ['pipeline-1'],
    ['tool-openai'],
    ['openai-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  assert(adapter.adapterId === 'adapter-1', 'Monotonic counter failed');
  assert(adapter.supportedModelIds[0] === 'openai-model-001', 'Model mapping mismatch');

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

  const model = OpenAIModelRegistry.createModel('openai-model-001', 'gpt-4o', OpenAIProvider.OPENAI, '1.0.0', 'Desc', OpenAIModelStatus.ACTIVE);
  OpenAIModelRegistry.register(model);

  // 3.1 Unregistered modelId dependency check
  try {
    const badAdapter = OpenAIAdapterFactory.create(
      'BadAdapter',
      'Desc',
      ['pipeline-1'],
      ['tool-openai'],
      ['openai-model-unregistered'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    OpenAIAdapterRegistry.register(badAdapter);
    assert(false, 'Should fail validation for unregistered modelId');
  } catch (e: any) {
    assert(e.message.includes('Model dependency not registered'), 'Error message mismatch');
  }

  // 3.2 Unregistered tool dependency check
  try {
    const badAdapter = OpenAIAdapterFactory.create(
      'BadAdapter2',
      'Desc',
      ['pipeline-1'],
      ['tool-unregistered'],
      ['openai-model-001'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    OpenAIAdapterRegistry.register(badAdapter);
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

  const model = OpenAIModelRegistry.createModel('openai-model-001', 'gpt-4o', OpenAIProvider.OPENAI, '1.0.0', 'Desc', OpenAIModelStatus.ACTIVE);
  OpenAIModelRegistry.register(model);

  const adapter = OpenAIAdapterFactory.create(
    'OpenAIAdapterMain',
    'Main OpenAI Adapter',
    ['pipeline-1'],
    ['tool-openai'],
    ['openai-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  const vm = OpenAIAdapterAdapter.toViewModel(adapter);
  assert(vm.id === adapter.adapterId, 'VM ID mismatch');
  assert(vm.name === 'OpenAIAdapterMain', 'VM name mismatch');
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

  const model = OpenAIModelRegistry.createModel('openai-model-001', 'gpt-4o', OpenAIProvider.OPENAI, '1.0.0', 'Desc', OpenAIModelStatus.ACTIVE);
  OpenAIModelRegistry.register(model);

  const adapter = OpenAIAdapterFactory.create(
    'OpenAIAdapterMain',
    'Main OpenAI Adapter',
    ['pipeline-1'],
    ['tool-openai'],
    ['openai-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );
  OpenAIAdapterRegistry.register(adapter);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  
  // 1. Get OpenAIAdapter via rule
  const resolvedAdapter = DevelopmentRules.getOpenAIAdapter(rule);
  assert(resolvedAdapter !== undefined, 'Should resolve OpenAIAdapter via rule');
  assert(resolvedAdapter?.adapterId === adapter.adapterId, 'Resolved adapter ID mismatch');

  // 2. Resolve OpenAIModels via rule (4-layer resolution)
  const resolvedModels = DevelopmentRules.getOpenAIModels(rule);
  assert(resolvedModels.length === 1, 'Should resolve 1 OpenAIModel');
  assert(resolvedModels[0].modelId === 'openai-model-001', 'Resolved model ID mismatch');
  assert(resolvedModels[0].provider === OpenAIProvider.OPENAI, 'Resolved provider mismatch');

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
    console.log('\nAll OpenAI Adapter Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
