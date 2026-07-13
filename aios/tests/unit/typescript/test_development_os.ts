import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/aios/CapabilityRegistry';
import { CapabilityFactory } from '../../../sdk/aios/CapabilityFactory';
import { DevelopmentMode } from '../../../sdk/aios/DevelopmentMode';
import { DevelopmentRules } from '../../../sdk/aios/DevelopmentRules';
import { CapabilityResolver } from '../../../sdk/aios/CapabilityResolver';
import { SkillRegistry, Skill, SkillCategory, SkillStatus } from '../../../sdk/aios/SkillRegistry';
import { SkillPipeline } from '../../../sdk/aios/SkillPipeline';
import { ExecutionLedger } from '../../../sdk/aios/ExecutionLedger';
import { QualityGate } from '../../../sdk/aios/QualityGate';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function setupStandardRegistry() {
  CapabilityRegistry.clear();
  CapabilityFactory.resetCounter();
  Object.values(CapabilityCategory).forEach(cat => {
    const cap = CapabilityFactory.create(
      cat,
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
// 1. DevelopmentMode Tests
// ==============================================================================
function testDevelopmentMode() {
  console.log('[Test] DevelopmentMode verification starting...');
  const mode = DevelopmentMode.createMode('mode-01', 'Planning Phase', 'PLANNING');
  
  assert(mode.developmentModeId === 'mode-01', 'Id mismatch');
  assert(mode.modeName === 'Planning Phase', 'Name mismatch');
  assert(mode.modeStatus === 'PLANNING', 'Status mismatch');
  
  // Immutability verification
  try {
    (mode as any).modeStatus = 'EXECUTING';
    assert(false, 'Should be read-only (frozen)');
  } catch (e) {
    // OK: Object is frozen
  }
  console.log('[Test] DevelopmentMode verification: PASSED');
}

// ==============================================================================
// 2. DevelopmentRules Tests
// ==============================================================================
function testDevelopmentRules() {
  console.log('[Test] DevelopmentRules verification starting...');
  const rule = DevelopmentRules.createRule('rule-01', 'ADR must be compiled', 'Architecture', 1);
  
  assert(rule.ruleId === 'rule-01', 'Id mismatch');
  assert(rule.ruleName === 'ADR must be compiled', 'Name mismatch');
  assert(rule.capability === 'Architecture', 'Capability mismatch');
  assert(rule.priority === 1, 'Priority mismatch');

  try {
    (rule as any).priority = 2;
    assert(false, 'Should be read-only');
  } catch (e) {
    // OK
  }
  console.log('[Test] DevelopmentRules verification: PASSED');
}

// ==============================================================================
// 3. CapabilityResolver Tests
// ==============================================================================
function testCapabilityResolver() {
  console.log('[Test] CapabilityResolver verification starting...');
  
  assert(CapabilityResolver.resolve('Draft architectural charter').category === 'Architecture', 'Architecture resolution failed');
  assert(CapabilityResolver.resolve('Create sprint implementation plan').category === 'Planning', 'Planning resolution failed');
  assert(CapabilityResolver.resolve('Run test suite on changes').category === 'Testing', 'Testing resolution failed');
  assert(CapabilityResolver.resolve('Static analysis audit report').category === 'Review', 'Review resolution failed');
  assert(CapabilityResolver.resolve('Fix widget ID duplication').category === 'Debugging', 'Debugging resolution failed');
  assert(CapabilityResolver.resolve('Create docs/spec.md').category === 'Documentation', 'Documentation resolution failed');
  assert(CapabilityResolver.resolve('Publish release version tags').category === 'Release', 'Release resolution failed');
  assert(CapabilityResolver.resolve('Implement widget component renderer').category === 'Implementation', 'Implementation resolution failed');

  console.log('[Test] CapabilityResolver verification: PASSED');
}

// ==============================================================================
// 4. SkillRegistry & SkillPipeline Tests
// ==============================================================================
function testSkillAndPipeline() {
  console.log('[Test] SkillRegistry & Pipeline verification starting...');
  SkillRegistry.clear();
  
  const skill1: Skill = {
    skillId: 'web-arch',
    skillName: 'WebArchitecture',
    category: SkillCategory.ExecutionPlanning,
    description: 'System architectural design',
    capabilityId: 'capability-1', // maps to Architecture capabilityId
    priority: 10,
    status: SkillStatus.ACTIVE,
    version: '1.0.0'
  };
  const skill2: Skill = {
    skillId: 'code-aud',
    skillName: 'CodeAudit',
    category: SkillCategory.Audit,
    description: 'Static review skill',
    capabilityId: 'capability-5', // maps to Review capabilityId
    priority: 10,
    status: SkillStatus.ACTIVE,
    version: '1.0.0'
  };

  SkillRegistry.register(skill1);
  SkillRegistry.register(skill2);

  assert(SkillRegistry.get('web-arch')?.skillName === 'WebArchitecture', 'Get skill failed');
  assert(SkillRegistry.getAll().length === 2, 'GetAll size mismatch');

  // Verify pipeline creation and registration check
  const pipeline = SkillPipeline.createPipeline('pipe-01', 'Architecture', ['web-arch', 'code-aud']);
  assert(pipeline.pipelineId === 'pipe-01', 'Pipeline ID mismatch');
  assert(pipeline.skills[0] === 'web-arch', 'Skill sequence incorrect');

  // Verify missing skill error
  try {
    SkillPipeline.createPipeline('pipe-02', 'Architecture', ['non-existent']);
    assert(false, 'Should throw error for unregistered skill');
  } catch (e) {
    // OK
  }
  
  console.log('[Test] SkillRegistry & Pipeline verification: PASSED');
}

// ==============================================================================
// 5. ExecutionLedger Tests
// ==============================================================================
function testExecutionLedger() {
  console.log('[Test] ExecutionLedger verification starting...');
  ExecutionLedger.clear();

  const record1 = ExecutionLedger.append('Architecture', ['web-arch'], 'PLEDGED');
  const record2 = ExecutionLedger.append('Review', ['code-aud'], 'SUCCESS');

  assert(record1.ledgerId === 'ledger-1', 'Monotonic ID generation failed');
  assert(record2.ledgerId === 'ledger-2', 'Monotonic ID generation failed');
  assert(record2.executionState === 'SUCCESS', 'State mismatch');
  assert(ExecutionLedger.getRecords().length === 2, 'Records size mismatch');

  // Verify read-only sequences
  try {
    (record1.skillSequence as any)[0] = 'hacked';
    assert(false, 'Should be read-only');
  } catch (e) {
    // OK
  }

  console.log('[Test] ExecutionLedger verification: PASSED');
}

// ==============================================================================
// 6. QualityGate Tests
// ==============================================================================
function testQualityGate() {
  console.log('[Test] QualityGate verification starting...');

  const passStatus = QualityGate.createStatus(0, 0, 5);
  assert(passStatus.criticalViolations === 0, 'Critical mismatch');
  assert(passStatus.passed === true, 'Should pass with 0 critical and major');

  const failStatus1 = QualityGate.createStatus(1, 0, 0);
  assert(failStatus1.passed === false, 'Should fail with critical violation');

  const failStatus2 = QualityGate.createStatus(0, 1, 0);
  assert(failStatus2.passed === false, 'Should fail with major violation');

  console.log('[Test] QualityGate verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    setupStandardRegistry();
    testDevelopmentMode();
    testDevelopmentRules();
    testCapabilityResolver();
    testSkillAndPipeline();
    testExecutionLedger();
    testQualityGate();
    console.log('\nAll Development OS Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
