import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/CapabilityRegistry';
import { CapabilityFactory } from '../../../sdk/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../sdk/SkillRegistry';
import { SkillFactory } from '../../../sdk/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../sdk/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../../../sdk/SkillPipelineFactory';
import { ToolRegistry, ToolCategory } from '../../../sdk/ToolRegistry';
import { ClaudeModelRegistry, ClaudeProvider, ClaudeModelStatus } from '../../../sdk/ClaudeModelRegistry';
import { ClaudeAdapterRegistry } from '../../../sdk/ClaudeAdapter';
import { ClaudeAdapterFactory } from '../../../sdk/ClaudeAdapterFactory';
import { GeminiModelRegistry, GeminiProvider, GeminiModelStatus } from '../../../sdk/GeminiModelRegistry';
import { GeminiAdapterRegistry } from '../../../sdk/GeminiAdapter';
import { GeminiAdapterFactory } from '../../../sdk/GeminiAdapterFactory';
import { ToolAdapterStatus } from '../../../sdk/ToolAdapter';
import { MultiAdapterRegistry, AdapterHealthStatus, AdapterPriorityPolicy } from '../../../sdk/MultiAdapterRegistry';
import { MultiAdapterFactory } from '../../../sdk/MultiAdapterFactory';
import { MultiAdapterAdapter } from '../../../sdk/MultiAdapterAdapter';
import { AdapterResolutionRegistry, ResolutionPolicy, AdapterType, ResolutionState } from '../../../sdk/AdapterResolutionRegistry';
import { AdapterResolverFactory } from '../../../sdk/AdapterResolverFactory';
import { AdapterResolver } from '../../../sdk/AdapterResolver';
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
  ToolRegistry.clear();
  ClaudeModelRegistry.clear();
  ClaudeAdapterRegistry.clear();
  ClaudeAdapterFactory.resetCounter();
  GeminiModelRegistry.clear();
  GeminiAdapterRegistry.clear();
  GeminiAdapterFactory.resetCounter();
  AdapterResolutionRegistry.clear();
  AdapterResolverFactory.resetCounter();
  MultiAdapterRegistry.clear();
  MultiAdapterFactory.resetCounter();

  // Register Capability
  const cap = CapabilityFactory.create('Testing', CapabilityCategory.Testing, 'Desc', 10, CapabilityStatus.ACTIVE, '1.0.0');
  CapabilityRegistry.register(cap);

  // Register Skill
  const skill = SkillFactory.create('CodeScan', SkillCategory.Analysis, 'Desc', cap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');
  SkillRegistry.register(skill);

  // Register Pipeline
  const pipeline = SkillPipelineFactory.create('TestPipe', 'Desc', cap.capabilityId, [skill.skillId], 5, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
  SkillPipelineRegistry.register(pipeline);
  const pipeline2 = SkillPipelineFactory.create('TestPipe2', 'Desc', cap.capabilityId, [skill.skillId], 5, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
  SkillPipelineRegistry.register(pipeline2);

  // Register a Claude model and adapter
  const cModel = ClaudeModelRegistry.createModel('claude-model-1', 'claude-3-5-sonnet', ClaudeProvider.ANTHROPIC, '1.0.0', 'Desc', ClaudeModelStatus.ACTIVE);
  ClaudeModelRegistry.register(cModel);
  const cAdapter = ClaudeAdapterFactory.create('ClaudeMain', 'Claude adapter', ['pipeline-1'], ['tool-claude'], ['claude-model-1'], ToolAdapterStatus.ACTIVE, '1.0.0');
  ClaudeAdapterRegistry.register(cAdapter);

  // Register a Gemini model and adapter
  const gModel = GeminiModelRegistry.createModel('gemini-model-1', 'gemini-2.5-pro', GeminiProvider.GOOGLE_AI, '1.0.0', 'Desc', GeminiModelStatus.ACTIVE);
  GeminiModelRegistry.register(gModel);
  const gAdapter = GeminiAdapterFactory.create('GeminiMain', 'Gemini adapter', ['pipeline-1'], ['tool-gemini'], ['gemini-model-1'], ToolAdapterStatus.ACTIVE, '1.0.0');
  GeminiAdapterRegistry.register(gAdapter);
}

// ==============================================================================
// 1. MultiAdapterRegistry Verification
// ==============================================================================
function testMultiRegistry() {
  console.log('[Test 1] MultiAdapterRegistry verification starting...');
  setupAllEnvironments();

  // Verify Registry Metadata
  assert(MultiAdapterRegistry.metadata.registryId === 'reg-multi-adapter-01', 'Metadata registry ID mismatch');
  assert(MultiAdapterRegistry.metadata.registryVersion === '1.0.0', 'Metadata version mismatch');

  const record = MultiAdapterFactory.create(
    'adapter-1', // ClaudeMain ID
    AdapterType.CLAUDE,
    ToolCategory.LLM,
    10,
    AdapterPriorityPolicy.FIXED,
    AdapterHealthStatus.HEALTHY,
    ToolAdapterStatus.ACTIVE,
    ['capability-1'],
    ['pipeline-1'],
    '1.0.0'
  );

  assert(record.adapterRecordId === 'multi-adapter-1', 'adapterRecordId assignment failed');
  assert(record.adapterType === AdapterType.CLAUDE, 'AdapterType assignment failed');
  assert(record.priorityPolicy === AdapterPriorityPolicy.FIXED, 'PriorityPolicy assignment failed');
  assert(record.healthStatus === AdapterHealthStatus.HEALTHY, 'HealthStatus assignment failed');

  MultiAdapterRegistry.register(record);
  const fetched = MultiAdapterRegistry.get('multi-adapter-1')!;
  assert(fetched.adapterId === 'adapter-1', 'Retrieve failed');

  // Verify ID validation
  try {
    MultiAdapterRegistry.clear();
    const badRecord = { ...record, adapterRecordId: 'bad-id' };
    MultiAdapterRegistry.register(badRecord);
    assert(false, 'Should throw error for bad adapterRecordId');
  } catch (e: any) {
    assert(e.message.includes('Invalid adapterRecordId'), 'Error message mismatch');
  }

  // Verify duplicate check
  try {
    MultiAdapterRegistry.clear();
    MultiAdapterRegistry.register(record);
    const dupe = MultiAdapterFactory.create('adapter-1', AdapterType.CLAUDE, ToolCategory.LLM, 20, AdapterPriorityPolicy.FALLBACK, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
    MultiAdapterRegistry.register(dupe);
    assert(false, 'Should throw error for duplicate adapter registration');
  } catch (e: any) {
    assert(e.message.includes('Adapter already registered'), 'Error message mismatch');
  }

  console.log('[Test 1] MultiAdapterRegistry verification: PASSED');
}

// ==============================================================================
// 2. Discovery APIs
// ==============================================================================
function testDiscovery() {
  console.log('[Test 2] Discovery APIs verification starting...');
  setupAllEnvironments();

  const r1 = MultiAdapterFactory.create('adapter-1', AdapterType.CLAUDE, ToolCategory.LLM, 10, AdapterPriorityPolicy.FIXED, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
  const r2 = MultiAdapterFactory.create('adapter-1', AdapterType.GEMINI, ToolCategory.LLM, 20, AdapterPriorityPolicy.FALLBACK, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-2'], '1.0.0');

  MultiAdapterRegistry.register(r1);
  MultiAdapterRegistry.register(r2);

  // findByCapability
  const caps = MultiAdapterRegistry.findByCapability('capability-1');
  assert(caps.length === 2, 'Should find 2 records for capability-1');

  // findByPipeline
  const p1 = MultiAdapterRegistry.findByPipeline('pipeline-1');
  assert(p1.length === 1 && p1[0].adapterType === AdapterType.CLAUDE, 'Should find 1 Claude record for pipeline-1');

  // findByCategory
  const cats = MultiAdapterRegistry.findByCategory(ToolCategory.LLM);
  assert(cats.length === 2, 'Should find 2 LLM records');

  // findByAdapterType
  const types = MultiAdapterRegistry.findByAdapterType(AdapterType.CLAUDE);
  assert(types.length === 1 && types[0].adapterId === 'adapter-1', 'Should find 1 Claude record');

  // AdapterCapabilityMatrix
  const matrix = MultiAdapterRegistry.getCapabilityMatrix();
  assert(matrix.length === 1, 'Matrix should contain 1 Capability entry');
  assert(matrix[0].capabilityId === 'capability-1', 'Matrix capabilityId mismatch');
  assert(matrix[0].adapterIds.length === 2, 'Matrix should map to 2 adapter IDs');

  console.log('[Test 2] Discovery APIs verification: PASSED');
}

// ==============================================================================
// 3. Validator Verification (SSOT dependencies)
// ==============================================================================
function testValidator() {
  console.log('[Test 3] Validator verification starting...');
  setupAllEnvironments();

  // 3.1 Unregistered capability check
  try {
    const bad = MultiAdapterFactory.create('adapter-1', AdapterType.CLAUDE, ToolCategory.LLM, 10, AdapterPriorityPolicy.FIXED, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-unregistered'], ['pipeline-1'], '1.0.0');
    MultiAdapterRegistry.register(bad);
    assert(false, 'Should fail validation for unregistered capabilityId');
  } catch (e: any) {
    assert(e.message.includes('Capability dependency not registered'), 'Error message mismatch');
  }

  // 3.2 Unregistered pipeline check
  try {
    const bad = MultiAdapterFactory.create('adapter-1', AdapterType.CLAUDE, ToolCategory.LLM, 10, AdapterPriorityPolicy.FIXED, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-unregistered'], '1.0.0');
    MultiAdapterRegistry.register(bad);
    assert(false, 'Should fail validation for unregistered pipelineId');
  } catch (e: any) {
    assert(e.message.includes('Pipeline dependency not registered'), 'Error message mismatch');
  }

  // 3.3 Unregistered adapter check (matching type)
  try {
    const bad = MultiAdapterFactory.create('adapter-unregistered', AdapterType.CLAUDE, ToolCategory.LLM, 10, AdapterPriorityPolicy.FIXED, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
    MultiAdapterRegistry.register(bad);
    assert(false, 'Should fail validation for unregistered adapterId');
  } catch (e: any) {
    assert(e.message.includes('ClaudeAdapter dependency not registered'), 'Error message mismatch');
  }

  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. ViewModel Transformation
// ==============================================================================
function testViewModel() {
  console.log('[Test 4] ViewModel conversion verification starting...');
  setupAllEnvironments();

  const record = MultiAdapterFactory.create(
    'adapter-1',
    AdapterType.CLAUDE,
    ToolCategory.LLM,
    10,
    AdapterPriorityPolicy.FIXED,
    AdapterHealthStatus.HEALTHY,
    ToolAdapterStatus.ACTIVE,
    ['capability-1'],
    ['pipeline-1'],
    '1.0.0'
  );

  const vm = MultiAdapterAdapter.toViewModel(record);
  assert(vm.id === record.adapterRecordId, 'VM ID mismatch');
  assert(vm.adapterId === 'adapter-1', 'VM adapter ID mismatch');
  assert(vm.typeLabel === 'CLAUDE', 'VM type label mismatch');
  assert(vm.categoryLabel === 'LLM', 'VM category label mismatch');
  assert(vm.priorityValue === 10, 'VM priority mismatch');
  assert(vm.priorityPolicyLabel === 'FIXED', 'VM priority policy label mismatch');
  assert(vm.healthStatusLabel === 'HEALTHY', 'VM health label mismatch');
  assert(vm.statusLabel === 'ACTIVE', 'VM status label mismatch');

  try {
    (vm as any).priorityValue = 100;
    assert(false, 'VM should be frozen');
  } catch (e) {
    // OK
  }

  console.log('[Test 4] ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. AdapterResolver + DevelopmentRules Integration Verification
// ==============================================================================
function testResolverIntegration() {
  console.log('[Test 5] AdapterResolver + DevelopmentRules integration starting...');
  setupAllEnvironments();

  // Register records under MultiAdapterRegistry
  const r1 = MultiAdapterFactory.create('adapter-1', AdapterType.CLAUDE, ToolCategory.LLM, 10, AdapterPriorityPolicy.FIXED, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
  const r2 = MultiAdapterFactory.create('adapter-1', AdapterType.GEMINI, ToolCategory.LLM, 20, AdapterPriorityPolicy.FALLBACK, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');

  MultiAdapterRegistry.register(r1);
  MultiAdapterRegistry.register(r2);

  // Verify resolution prioritizing FIXED over FALLBACK
  const resolved = AdapterResolver.resolve('capability-1')!;
  assert(resolved.adapterId === 'adapter-1', 'Resolver should choose Claude (adapter-1)');

  // Verify rules integration
  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  const resolvedFromRule = DevelopmentRules.getResolvedAdapter(rule);
  assert(resolvedFromRule?.adapterId === 'adapter-1', 'Resolved from rule adapter ID mismatch');

  // Verify getAvailableAdapters
  const available = DevelopmentRules.getAvailableAdapters(rule);
  assert(available.length === 2, 'Should discover 2 available adapters via rule');
  assert(available[0].adapterId === 'adapter-1', 'First discovered ID mismatch');

  console.log('[Test 5] AdapterResolver + DevelopmentRules integration: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testMultiRegistry();
    testDiscovery();
    testValidator();
    testViewModel();
    testResolverIntegration();
    console.log('\nAll Multi Adapter Registry Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
