import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/aios/CapabilityRegistry';
import { CapabilityFactory } from '../../../sdk/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../sdk/aios/SkillRegistry';
import { SkillFactory } from '../../../sdk/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../sdk/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../../../sdk/aios/SkillPipelineFactory';
import { ToolRegistry, ToolCategory, ToolStatus } from '../../../sdk/aios/ToolRegistry';
import { AntigravityCommandRegistry, AntigravityCommandCategory, AntigravityCommandStatus } from '../../../sdk/aios/AntigravityCommandRegistry';
import { AntigravityAdapterRegistry } from '../../../sdk/aios/AntigravityAdapter';
import { ToolAdapterStatus } from '../../../sdk/aios/ToolAdapter';
import { AntigravityAdapterFactory } from '../../../sdk/aios/AntigravityAdapterFactory';
import { AntigravityAdapterAdapter } from '../../../sdk/aios/AntigravityAdapterAdapter';
import { DevelopmentRules } from '../../../sdk/aios/DevelopmentRules';

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
  ToolRegistry.clear(); // Will automatically re-register tool-antigravity
  AntigravityCommandRegistry.clear();
  AntigravityAdapterRegistry.clear();
  AntigravityAdapterFactory.resetCounter();

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
// 1. AntigravityCommandRegistry Verification
// ==============================================================================
function testCommandRegistry() {
  console.log('[Test 1] AntigravityCommandRegistry verification starting...');
  setupAllEnvironments();

  const command = AntigravityCommandRegistry.createCommand(
    'ag-command-001',
    'chrome-devtools',
    AntigravityCommandCategory.Debugging,
    'Devtools inspection',
    AntigravityCommandStatus.ACTIVE,
    '1.0.0'
  );

  assert(command.commandId === 'ag-command-001', 'commandId assignment failed');
  assert(command.category === AntigravityCommandCategory.Debugging, 'Category category assignment failed');

  AntigravityCommandRegistry.register(command);
  const fetched = AntigravityCommandRegistry.get('ag-command-001')!;
  assert(fetched.commandName === 'chrome-devtools', 'Retrieve failed');

  // Verify ID validation
  try {
    AntigravityCommandRegistry.createCommand('bad-id', 'test', AntigravityCommandCategory.Utility, 'Desc', AntigravityCommandStatus.ACTIVE, '1.0.0');
    assert(false, 'Should throw error for bad commandId');
  } catch (e: any) {
    assert(e.message.includes('Invalid commandId'), 'Error message mismatch');
  }

  // Verify duplicate name rejection
  try {
    const dupe = AntigravityCommandRegistry.createCommand('ag-command-002', 'chrome-devtools', AntigravityCommandCategory.Debugging, 'Dupe', AntigravityCommandStatus.ACTIVE, '1.0.0');
    AntigravityCommandRegistry.register(dupe);
    assert(false, 'Should throw error for duplicate commandName');
  } catch (e: any) {
    assert(e.message.includes('Command Name already registered'), 'Error message mismatch');
  }

  console.log('[Test 1] AntigravityCommandRegistry verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and ID verification starting...');
  setupAllEnvironments();

  const cmd = AntigravityCommandRegistry.createCommand('ag-command-001', 'modern-web-guidance', AntigravityCommandCategory.Frontend, 'Desc', AntigravityCommandStatus.ACTIVE, '1.0.0');
  AntigravityCommandRegistry.register(cmd);

  // We have tool-antigravity pre-registered in ToolRegistry, and TestPipe in SkillPipelineRegistry
  const adapter = AntigravityAdapterFactory.create(
    'AntigravityAdapterMain',
    'Main Antigravity Adapter',
    ['pipeline-1'],
    ['tool-antigravity'],
    ['ag-command-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  assert(adapter.adapterId === 'adapter-1', 'Monotonic counter failed');
  assert(adapter.supportedCommandIds[0] === 'ag-command-001', 'Command mapping mismatch');

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

  const cmd = AntigravityCommandRegistry.createCommand('ag-command-001', 'modern-web-guidance', AntigravityCommandCategory.Frontend, 'Desc', AntigravityCommandStatus.ACTIVE, '1.0.0');
  AntigravityCommandRegistry.register(cmd);

  // 3.1 Unregistered commandId dependency check
  try {
    const badAdapter = AntigravityAdapterFactory.create(
      'BadAdapter',
      'Desc',
      ['pipeline-1'],
      ['tool-antigravity'],
      ['ag-command-unregistered'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    AntigravityAdapterRegistry.register(badAdapter);
    assert(false, 'Should fail validation for unregistered commandId');
  } catch (e: any) {
    assert(e.message.includes('Command dependency not registered'), 'Error message mismatch');
  }

  // 3.2 Unregistered tool dependency check
  try {
    const badAdapter = AntigravityAdapterFactory.create(
      'BadAdapter2',
      'Desc',
      ['pipeline-1'],
      ['tool-unregistered'],
      ['ag-command-001'],
      ToolAdapterStatus.ACTIVE,
      '1.0.0'
    );
    AntigravityAdapterRegistry.register(badAdapter);
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

  const cmd = AntigravityCommandRegistry.createCommand('ag-command-001', 'modern-web-guidance', AntigravityCommandCategory.Frontend, 'Desc', AntigravityCommandStatus.ACTIVE, '1.0.0');
  AntigravityCommandRegistry.register(cmd);

  const adapter = AntigravityAdapterFactory.create(
    'AntigravityAdapterMain',
    'Main Antigravity Adapter',
    ['pipeline-1'],
    ['tool-antigravity'],
    ['ag-command-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  const vm = AntigravityAdapterAdapter.toViewModel(adapter);
  assert(vm.id === adapter.adapterId, 'VM ID mismatch');
  assert(vm.name === 'AntigravityAdapterMain', 'VM name mismatch');
  assert(vm.commandCount === 1, 'VM command count mismatch');
  assert(vm.statusLabel === 'ACTIVE', 'VM status label mismatch');

  try {
    (vm as any).commandCount = 10;
    assert(false, 'VM should be frozen');
  } catch (e) {
    // OK
  }

  console.log('[Test 4] ViewModel conversion verification: PASSED');
}

// ==============================================================================
// 5. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 5] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  const cmd = AntigravityCommandRegistry.createCommand('ag-command-001', 'modern-web-guidance', AntigravityCommandCategory.Frontend, 'Desc', AntigravityCommandStatus.ACTIVE, '1.0.0');
  AntigravityCommandRegistry.register(cmd);

  const adapter = AntigravityAdapterFactory.create(
    'AntigravityAdapterMain',
    'Main Antigravity Adapter',
    ['pipeline-1'],
    ['tool-antigravity'],
    ['ag-command-001'],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );
  AntigravityAdapterRegistry.register(adapter);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  const resolved = DevelopmentRules.getAntigravityAdapter(rule);

  assert(resolved !== undefined, 'Should resolve AntigravityAdapter via rule');
  assert(resolved?.adapterId === adapter.adapterId, 'Resolved adapter ID mismatch');

  console.log('[Test 5] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testCommandRegistry();
    testFactoryAndIds();
    testValidator();
    testViewModel();
    testRulesIntegration();
    console.log('\nAll Antigravity Adapter Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
