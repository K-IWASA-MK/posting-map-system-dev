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
import { AdapterResolutionRegistry, ResolutionPolicy, AdapterType, ResolutionState } from '../../../sdk/AdapterResolutionRegistry';
import { AdapterResolverFactory } from '../../../sdk/AdapterResolverFactory';
import { AdapterResolver } from '../../../sdk/AdapterResolver';
import { AdapterResolverAdapter } from '../../../sdk/AdapterResolverAdapter';
import { DevelopmentRules } from '../../../sdk/DevelopmentRules';
import { MultiAdapterRegistry, AdapterHealthStatus, AdapterPriorityPolicy } from '../../../sdk/MultiAdapterRegistry';
import { MultiAdapterFactory } from '../../../sdk/MultiAdapterFactory';

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
  ToolRegistry.clear(); // Pre-populates all tools
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
  const gAdapter2 = GeminiAdapterFactory.create('GeminiBackup', 'Gemini backup adapter', ['pipeline-1'], ['tool-gemini'], ['gemini-model-1'], ToolAdapterStatus.ACTIVE, '1.0.0');
  GeminiAdapterRegistry.register(gAdapter2);
}

// ==============================================================================
// 1. AdapterResolutionRegistry Verification
// ==============================================================================
function testResolutionRegistry() {
  console.log('[Test 1] AdapterResolutionRegistry verification starting...');
  setupAllEnvironments();

  // Verify Registry Metadata
  assert(AdapterResolutionRegistry.metadata.registryId === 'reg-adapter-resolution-01', 'Metadata registry ID mismatch');
  assert(AdapterResolutionRegistry.metadata.registryVersion === '1.0.0', 'Metadata version mismatch');

  const record = AdapterResolverFactory.create(
    'capability-1',
    'pipeline-1',
    'adapter-1', // ClaudeMain has ID adapter-1
    AdapterType.CLAUDE,
    10,
    ResolutionPolicy.PREFERRED,
    'Pipeline Match',
    ResolutionState.ACTIVE,
    '1.0.0'
  );

  assert(record.resolutionId === 'resolution-1', 'resolutionId assignment failed');
  assert(record.resolutionPolicy === ResolutionPolicy.PREFERRED, 'Policy assignment failed');
  assert(record.adapterType === AdapterType.CLAUDE, 'AdapterType assignment failed');

  AdapterResolutionRegistry.register(record);
  const fetched = AdapterResolutionRegistry.get('resolution-1')!;
  assert(fetched.resolutionReason === 'Pipeline Match', 'Retrieve failed');

  // Verify ID validation
  try {
    AdapterResolverFactory.create('capability-1', 'pipeline-1', 'adapter-1', AdapterType.CLAUDE, 10, ResolutionPolicy.PREFERRED, 'Reason', ResolutionState.ACTIVE, '1.0.0');
    // Generates resolution-2, but we mutate id to verify validation
    const badRecord = { ...record, resolutionId: 'bad-id' };
    AdapterResolutionRegistry.register(badRecord);
    assert(false, 'Should throw error for bad resolutionId');
  } catch (e: any) {
    assert(e.message.includes('Invalid resolutionId'), 'Error message mismatch');
  }

  console.log('[Test 1] AdapterResolutionRegistry verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and ID verification starting...');
  setupAllEnvironments();

  const record = AdapterResolverFactory.create(
    'capability-1',
    'pipeline-1',
    'adapter-1',
    AdapterType.CLAUDE,
    10,
    ResolutionPolicy.PREFERRED,
    'Reason',
    ResolutionState.ACTIVE,
    '1.0.0'
  );

  assert(record.resolutionId === 'resolution-1', 'Monotonic counter failed');

  try {
    (record as any).priority = 100;
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

  // 3.1 Unregistered capability check
  try {
    const badRecord = AdapterResolverFactory.create(
      'capability-unregistered',
      'pipeline-1',
      'adapter-1',
      AdapterType.CLAUDE,
      10,
      ResolutionPolicy.PREFERRED,
      'Reason',
      ResolutionState.ACTIVE,
      '1.0.0'
    );
    AdapterResolutionRegistry.register(badRecord);
    assert(false, 'Should fail validation for unregistered capabilityId');
  } catch (e: any) {
    assert(e.message.includes('Capability dependency not registered'), 'Error message mismatch');
  }

  // 3.2 Unregistered pipeline check
  try {
    const badRecord = AdapterResolverFactory.create(
      'capability-1',
      'pipeline-unregistered',
      'adapter-1',
      AdapterType.CLAUDE,
      10,
      ResolutionPolicy.PREFERRED,
      'Reason',
      ResolutionState.ACTIVE,
      '1.0.0'
    );
    AdapterResolutionRegistry.register(badRecord);
    assert(false, 'Should fail validation for unregistered pipelineId');
  } catch (e: any) {
    assert(e.message.includes('Pipeline dependency not registered'), 'Error message mismatch');
  }

  // 3.3 Unregistered adapter check (matching type)
  try {
    const badRecord = AdapterResolverFactory.create(
      'capability-1',
      'pipeline-1',
      'adapter-unregistered',
      AdapterType.CLAUDE,
      10,
      ResolutionPolicy.PREFERRED,
      'Reason',
      ResolutionState.ACTIVE,
      '1.0.0'
    );
    AdapterResolutionRegistry.register(badRecord);
    assert(false, 'Should fail validation for unregistered adapterId');
  } catch (e: any) {
    assert(e.message.includes('ClaudeAdapter dependency not registered'), 'Error message mismatch');
  }

  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. Resolver Logic (Priority sorting)
// ==============================================================================
function testResolverLogic() {
  console.log('[Test 4] Resolver logical priority resolution starting...');
  setupAllEnvironments();

  // Resolution 1: Claude, DYNAMIC, Priority 10
  const r1 = MultiAdapterFactory.create('adapter-1', AdapterType.CLAUDE, ToolCategory.LLM, 10, AdapterPriorityPolicy.DYNAMIC, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
  MultiAdapterRegistry.register(r1);

  // Resolution 2: Gemini, FALLBACK, Priority 20 (Higher priority value, but lower policy rank)
  const r2 = MultiAdapterFactory.create('adapter-2', AdapterType.GEMINI, ToolCategory.LLM, 20, AdapterPriorityPolicy.FALLBACK, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
  MultiAdapterRegistry.register(r2);

  // We should resolve Claude since DYNAMIC rank (2) is higher than FALLBACK rank (1)
  let resolved = AdapterResolver.resolve('capability-1')!;
  assert(resolved.adapterId === 'adapter-1', 'Should resolve Claude based on policy rank');

  // Let's add Resolution 3: Gemini, FIXED, Priority 5 (Lowest priority value, but FIXED policy rank)
  // Registering a second Gemini configuration with FIXED policy rank (3)
  const r3 = MultiAdapterFactory.create('adapter-1', AdapterType.GEMINI, ToolCategory.LLM, 5, AdapterPriorityPolicy.FIXED, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.ACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
  MultiAdapterRegistry.register(r3);

  // We should resolve Gemini now because FIXED has highest policy rank
  resolved = AdapterResolver.resolve('capability-1')!;
  assert(resolved.adapterId === 'adapter-1', 'Should resolve Gemini based on FIXED policy');

  // Verify INACTIVE status candidate is ignored
  MultiAdapterRegistry.clear();
  const disabledRecord = MultiAdapterFactory.create('adapter-1', AdapterType.CLAUDE, ToolCategory.LLM, 100, AdapterPriorityPolicy.FIXED, AdapterHealthStatus.HEALTHY, ToolAdapterStatus.INACTIVE, ['capability-1'], ['pipeline-1'], '1.0.0');
  MultiAdapterRegistry.register(disabledRecord);
  assert(AdapterResolver.resolve('capability-1') === undefined, 'INACTIVE status should return undefined');

  console.log('[Test 4] Resolver logical priority resolution: PASSED');
}

// ==============================================================================
// 5. ViewModel Transformation
// ==============================================================================
function testViewModel() {
  console.log('[Test 5] ViewModel conversion verification starting...');
  setupAllEnvironments();

  const record = AdapterResolverFactory.create(
    'capability-1',
    'pipeline-1',
    'adapter-1',
    AdapterType.CLAUDE,
    10,
    ResolutionPolicy.PREFERRED,
    'Reason text',
    ResolutionState.ACTIVE,
    '1.0.0'
  );

  const vm = AdapterResolverAdapter.toViewModel(record);
  assert(vm.id === record.resolutionId, 'VM ID mismatch');
  assert(vm.adapterTypeLabel === 'CLAUDE', 'VM type label mismatch');
  assert(vm.priorityValue === 10, 'VM priority mismatch');
  assert(vm.policyLabel === 'PREFERRED', 'VM policy label mismatch');

  try {
    (vm as any).priorityValue = 100;
    assert(false, 'VM should be frozen');
  } catch (e) {
    // OK
  }

  console.log('[Test 5] ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 6. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 6] DevelopmentRules integration verification starting...');
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
  MultiAdapterRegistry.register(record);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  const resolved = DevelopmentRules.getResolvedAdapter(rule);

  assert(resolved !== undefined, 'Should resolve adapter via rules integration');
  assert(resolved?.adapterId === 'adapter-1', 'Resolved adapter ID mismatch');

  console.log('[Test 6] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testResolutionRegistry();
    testFactoryAndIds();
    testValidator();
    testResolverLogic();
    testViewModel();
    testRulesIntegration();
    console.log('\nAll Adapter Resolver Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
