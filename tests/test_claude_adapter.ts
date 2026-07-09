import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../src/aios/SkillRegistry';
import { SkillFactory } from '../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../src/aios/SkillPipelineFactory';
import { ToolRegistry } from '../src/aios/ToolRegistry';
import { ClaudeModelRegistry, ClaudeProvider, ClaudeModelStatus } from '../src/aios/ClaudeModelRegistry';
import { ClaudeAdapterRegistry } from '../src/aios/ClaudeAdapter';
import { ToolAdapterStatus } from '../src/aios/ToolAdapter';
import { ClaudeAdapterFactory } from '../src/aios/ClaudeAdapterFactory';
import { ClaudeAdapterAdapter } from '../src/aios/ClaudeAdapterAdapter';
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
  ToolRegistry.clear(); // Pre-populates tool-antigravity and tool-claude
  ClaudeModelRegistry.clear();
  ClaudeAdapterRegistry.clear();
  ClaudeAdapterFactory.resetCounter();

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
// 1. ClaudeModelRegistry Verification
// ==============================================================================
function testModelRegistry() {
  console.log('[Test 1] ClaudeModelRegistry verification starting...');
  setupAllEnvironments();

  // Verify Registry Metadata
  assert(ClaudeModelRegistry.metadata.registryId === 'reg-claude-model-01', 'Metadata registry ID mismatch');
  assert(ClaudeModelRegistry.metadata.registryVersion === '1.0.0', 'Metadata version mismatch');

  const model = ClaudeModelRegistry.createModel(
    'claude-model-001',
    'claude-3-5-sonnet',
    ClaudeProvider.ANTHROPIC,
    '1.0.0',
    'Anthropic Sonnet model',
    ClaudeModelStatus.ACTIVE
  );

  assert(model.modelId === 'claude-model-001', 'modelId assignment failed');
  assert(model.provider === ClaudeProvider.ANTHROPIC, 'Provider assignment failed');
  assert(model.status === ClaudeModelStatus.ACTIVE, 'Status assignment failed');

  ClaudeModelRegistry.register(model);
  const fetched = ClaudeModelRegistry.get('claude-model-001')!;
  assert(fetched.modelName === 'claude-3-5-sonnet', 'Retrieve failed');

  // Verify ID validation
  try {
    ClaudeModelRegistry.createModel('bad-id', 'test', ClaudeProvider.ANTHROPIC, '1.0.0', 'Desc', ClaudeModelStatus.ACTIVE);
    assert(false, 'Should throw error for bad modelId');
  } catch (e: any) {
    assert(e.message.includes('Invalid modelId'), 'Error message mismatch');
  }

  // Verify duplicate name rejection
  try {
    const dupe = ClaudeModelRegistry.createModel('claude-model-002', 'claude-3-5-sonnet', ClaudeProvider.ANTHROPIC, '1.0.0', 'Dupe', ClaudeModelStatus.ACTIVE);
    ClaudeModelRegistry.register(dupe);
    assert(false, 'Should throw error for duplicate modelName');
  } catch (e: any) {
    assert(e.message.includes('Model Name already registered'), 'Error message mismatch');
  }

  console.log('[Test 1] ClaudeModelRegistry verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and ID verification starting...');
  setupAllEnvironments();

  const model = ClaudeModelRegistry.createModel('claude-model-001', 'claude-3-5-sonnet', ClaudeProvider.ANTHROPIC, '1.0.0', 'Desc', ClaudeModelStatus.ACTIVE);
  ClaudeModelRegistry.register(model);

  const adapter = ClaudeAdapterFactory.create(
    'ClaudeAdapterMain',
    'Main Claude Adapter',
    ['pipeline-1'],
    ['tool-claude'],
    ['claude-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  assert(adapter.adapterId === 'adapter-1', 'Monotonic counter failed');
  assert(adapter.supportedModelIds[0] === 'claude-model-001', 'Model mapping mismatch');

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

  const model = ClaudeModelRegistry.createModel('claude-model-001', 'claude-3-5-sonnet', ClaudeProvider.ANTHROPIC, '1.0.0', 'Desc', ClaudeModelStatus.ACTIVE);
  ClaudeModelRegistry.register(model);

  // 3.1 Unregistered modelId dependency check
  try {
    const badAdapter = ClaudeAdapterFactory.create(
      'BadAdapter',
      'Desc',
      ['pipeline-1'],
      ['tool-claude'],
      ['claude-model-unregistered'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    ClaudeAdapterRegistry.register(badAdapter);
    assert(false, 'Should fail validation for unregistered modelId');
  } catch (e: any) {
    assert(e.message.includes('Model dependency not registered'), 'Error message mismatch');
  }

  // 3.2 Unregistered tool dependency check
  try {
    const badAdapter = ClaudeAdapterFactory.create(
      'BadAdapter2',
      'Desc',
      ['pipeline-1'],
      ['tool-unregistered'],
      ['claude-model-001'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    ClaudeAdapterRegistry.register(badAdapter);
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

  const model = ClaudeModelRegistry.createModel('claude-model-001', 'claude-3-5-sonnet', ClaudeProvider.ANTHROPIC, '1.0.0', 'Desc', ClaudeModelStatus.ACTIVE);
  ClaudeModelRegistry.register(model);

  const adapter = ClaudeAdapterFactory.create(
    'ClaudeAdapterMain',
    'Main Claude Adapter',
    ['pipeline-1'],
    ['tool-claude'],
    ['claude-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  const vm = ClaudeAdapterAdapter.toViewModel(adapter);
  assert(vm.id === adapter.adapterId, 'VM ID mismatch');
  assert(vm.name === 'ClaudeAdapterMain', 'VM name mismatch');
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

  const model = ClaudeModelRegistry.createModel('claude-model-001', 'claude-3-5-sonnet', ClaudeProvider.ANTHROPIC, '1.0.0', 'Desc', ClaudeModelStatus.ACTIVE);
  ClaudeModelRegistry.register(model);

  const adapter = ClaudeAdapterFactory.create(
    'ClaudeAdapterMain',
    'Main Claude Adapter',
    ['pipeline-1'],
    ['tool-claude'],
    ['claude-model-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );
  ClaudeAdapterRegistry.register(adapter);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  
  // 1. Get ClaudeAdapter via rule
  const resolvedAdapter = DevelopmentRules.getClaudeAdapter(rule);
  assert(resolvedAdapter !== undefined, 'Should resolve ClaudeAdapter via rule');
  assert(resolvedAdapter?.adapterId === adapter.adapterId, 'Resolved adapter ID mismatch');

  // 2. Resolve ClaudeModels via rule (4-layer resolution)
  const resolvedModels = DevelopmentRules.getClaudeModels(rule);
  assert(resolvedModels.length === 1, 'Should resolve 1 ClaudeModel');
  assert(resolvedModels[0].modelId === 'claude-model-001', 'Resolved model ID mismatch');
  assert(resolvedModels[0].provider === ClaudeProvider.ANTHROPIC, 'Resolved provider mismatch');

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
    console.log('\nAll Claude Adapter Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
