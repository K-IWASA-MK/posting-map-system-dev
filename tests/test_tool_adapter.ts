import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../src/aios/SkillRegistry';
import { SkillFactory } from '../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../src/aios/SkillPipelineFactory';
import { ToolRegistry, ToolCategory, ToolStatus } from '../src/aios/ToolRegistry';
import { ToolFactory } from '../src/aios/ToolFactory';
import { ToolAdapterRegistry, ToolAdapterStatus } from '../src/aios/ToolAdapter';
import { ToolAdapterFactory } from '../src/aios/ToolAdapterFactory';
import { ToolAdapterAdapter } from '../src/aios/ToolAdapterAdapter';
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
  ToolRegistry.clear();
  ToolFactory.resetCounter();
  ToolAdapterRegistry.clear();
  ToolAdapterFactory.resetCounter();

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
// 1. ToolRegistry & Factory Verification
// ==============================================================================
function testToolRegistryAndFactory() {
  console.log('[Test 1] ToolRegistry and ToolFactory verification starting...');
  setupAllEnvironments();

  const tool = ToolFactory.create('WebBrowser', ToolCategory.Browser, 'Headless chrome', ToolStatus.ACTIVE, '1.0.0');
  assert(tool.toolId === 'tool-1', 'Tool ID monotonic counter failed');
  assert(tool.category === ToolCategory.Browser, 'Category mapping failed');

  ToolRegistry.register(tool);
  const fetched = ToolRegistry.get(tool.toolId)!;
  assert(fetched.toolName === 'WebBrowser', 'Retrieve failed');

  // Verify duplicate name rejection
  try {
    const dupe = ToolFactory.create('WebBrowser', ToolCategory.Browser, 'Another', ToolStatus.ACTIVE, '1.0.0');
    ToolRegistry.register(dupe);
    assert(false, 'Should reject duplicate tool names');
  } catch (e: any) {
    assert(e.message.includes('Tool Name already registered'), 'Error message mismatch');
  }

  console.log('[Test 1] ToolRegistry and ToolFactory verification: PASSED');
}

// ==============================================================================
// 2. ToolAdapterRegistry & Factory Verification
// ==============================================================================
function testToolAdapterRegistryAndFactory() {
  console.log('[Test 2] ToolAdapterRegistry and ToolAdapterFactory verification starting...');
  setupAllEnvironments();

  // Register a tool
  const tool = ToolFactory.create('Terminal', ToolCategory.Shell, 'zsh shell', ToolStatus.ACTIVE, '1.0.0');
  ToolRegistry.register(tool);

  // Create Adapter
  const adapter = ToolAdapterFactory.create(
    'ShellAdapter',
    'Shell execution adapter',
    ['pipeline-1'],
    [tool.toolId],
    ToolAdapterStatus.ACTIVE,
    '1.0.0'
  );

  assert(adapter.adapterId === 'adapter-1', 'Monotonic adapter ID counter failed');
  assert(adapter.supportedPipelineIds[0] === 'pipeline-1', 'Pipeline ID mapping failed');
  assert(adapter.supportedToolIds[0] === tool.toolId, 'Tool ID mapping failed');

  ToolAdapterRegistry.register(adapter);
  const fetched = ToolAdapterRegistry.get(adapter.adapterId)!;
  assert(fetched.adapterName === 'ShellAdapter', 'Retrieve failed');

  console.log('[Test 2] ToolAdapterRegistry and ToolAdapterFactory: PASSED');
}

// ==============================================================================
// 3. Validator Dependencies Verification
// ==============================================================================
function testValidatorDependencies() {
  console.log('[Test 3] Validator dependencies verification starting...');
  setupAllEnvironments();

  // 3.1 Register Tool, check unregistered pipeline
  const tool = ToolFactory.create('Editor', ToolCategory.IDE, 'VS Code', ToolStatus.ACTIVE, '1.0.0');
  ToolRegistry.register(tool);

  try {
    const badAdapter = ToolAdapterFactory.create('BadAdapter', 'Desc', ['pipeline-unregistered'], [tool.toolId], ToolAdapterStatus.ACTIVE, '1.0.0');
    ToolAdapterRegistry.register(badAdapter);
    assert(false, 'Should fail for unregistered pipeline ID');
  } catch (e: any) {
    assert(e.message.includes('Pipeline dependency not registered'), 'Error message mismatch');
  }

  // 3.2 Register Pipeline, check unregistered tool
  try {
    const badAdapter = ToolAdapterFactory.create('BadAdapter2', 'Desc', ['pipeline-1'], ['tool-unregistered'], ToolAdapterStatus.ACTIVE, '1.0.0');
    ToolAdapterRegistry.register(badAdapter);
    assert(false, 'Should fail for unregistered tool ID');
  } catch (e: any) {
    assert(e.message.includes('Tool dependency not registered'), 'Error message mismatch');
  }

  console.log('[Test 3] Validator dependencies verification: PASSED');
}

// ==============================================================================
// 4. ViewModel Transformation
// ==============================================================================
function testViewModel() {
  console.log('[Test 4] ViewModel conversion verification starting...');
  setupAllEnvironments();

  const tool = ToolFactory.create('GitCLI', ToolCategory.VersionControl, 'Git binary', ToolStatus.ACTIVE, '1.0.0');
  ToolRegistry.register(tool);

  const adapter = ToolAdapterFactory.create('GitAdapter', 'Git adapter description', ['pipeline-1'], [tool.toolId], ToolAdapterStatus.ACTIVE, '1.0.0');
  
  const vm = ToolAdapterAdapter.toViewModel(adapter);
  assert(vm.id === adapter.adapterId, 'VM ID mismatch');
  assert(vm.name === 'GitAdapter', 'VM name mismatch');
  assert(vm.statusLabel === 'ACTIVE', 'VM status label mismatch');
  assert(vm.toolCount === 1, 'VM tool count mismatch');
  assert(vm.pipelineCount === 1, 'VM pipeline count mismatch');

  try {
    (vm as any).name = 'Modified';
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

  const tool = ToolFactory.create('GeminiPro', ToolCategory.LLM, 'Gemini model', ToolStatus.ACTIVE, '1.0.0');
  ToolRegistry.register(tool);

  const adapter = ToolAdapterFactory.create('GeminiAdapter', 'Gemini model adapter', ['pipeline-1'], [tool.toolId], ToolAdapterStatus.ACTIVE, '1.0.0');
  ToolAdapterRegistry.register(adapter);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  const resolved = DevelopmentRules.getToolAdapters(rule);

  assert(resolved.length === 1, 'Should resolve 1 adapter via rule');
  assert(resolved[0].adapterId === adapter.adapterId, 'Resolved adapter ID mismatch');

  console.log('[Test 5] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testToolRegistryAndFactory();
    testToolAdapterRegistryAndFactory();
    testValidatorDependencies();
    testViewModel();
    testRulesIntegration();
    console.log('\nAll Tool Adapter Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
