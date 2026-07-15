import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../../../sdk/CapabilityRegistry';
import { CapabilityFactory } from '../../../sdk/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../../../sdk/SkillRegistry';
import { SkillFactory } from '../../../sdk/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../../../sdk/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../../../sdk/SkillPipelineFactory';
import { ExecutionLedgerRegistry, ExecutionState } from '../../../sdk/ExecutionLedgerRegistry';
import { ExecutionLedgerFactory } from '../../../sdk/ExecutionLedgerFactory';
import { QualityGateRegistry, QualityGateState } from '../../../sdk/QualityGateRegistry';
import { QualityGateFactory } from '../../../sdk/QualityGateFactory';
import { QualityGateValidator } from '../../../sdk/QualityGateValidator';
import { QualityGateAdapter } from '../../../sdk/QualityGateAdapter';
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
  ExecutionLedgerRegistry.clear();
  ExecutionLedgerFactory.resetCounter();
  QualityGateRegistry.clear();
  QualityGateFactory.resetCounter();

  // Register Capability
  const cap = CapabilityFactory.create('Testing', CapabilityCategory.Testing, 'Desc', 10, CapabilityStatus.ACTIVE, '1.0.0');
  CapabilityRegistry.register(cap);

  // Register Skill
  const skill = SkillFactory.create('CodeScan', SkillCategory.Analysis, 'Desc', cap.capabilityId, 5, SkillStatus.ACTIVE, '1.0.0');
  SkillRegistry.register(skill);

  // Register Pipeline
  const pipeline = SkillPipelineFactory.create('TestPipe', 'Desc', cap.capabilityId, [skill.skillId], 5, SkillPipelineStatus.ACTIVE, '1.0.0', '1.0.0');
  SkillPipelineRegistry.register(pipeline);

  // Register Ledger
  const ledger = ExecutionLedgerFactory.create('TestLedger', cap.capabilityId, pipeline.pipelineId, [skill.skillId], ExecutionState.PLANNED, '1.0.0', '1.0.0');
  ExecutionLedgerRegistry.register(ledger);
}

// ==============================================================================
// 1. Metadata Verification
// ==============================================================================
function testMetadata() {
  console.log('[Test 1] QualityGateRegistry Metadata verification starting...');
  assert(QualityGateRegistry.metadata.registryId === 'reg-gate-01', 'Registry ID mismatch');
  assert(QualityGateRegistry.metadata.registryVersion === '1.0.0', 'Version mismatch');
  console.log('[Test 1] QualityGateRegistry Metadata verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and Deterministic ID verification starting...');
  setupAllEnvironments();

  const gate = QualityGateFactory.create(
    'Verify testing quality',
    'ledger-1',
    0,
    0,
    1,
    QualityGateState.CREATED,
    '1.0.0',
    '1.0.0',
    '1.0.0'
  );

  assert(gate.gateId === 'gate-1', 'Monotonic counter ID failed');
  assert(gate.passed === true, 'Passed calculation mismatch');
  assert(gate.evaluationSummary === '0 Critical / 0 Major / 1 Minor', 'Evaluation summary mismatch');
  
  try {
    (gate as any).passed = false;
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
  setupAllEnvironments();

  // 3.1 Unregistered ledgerId check
  try {
    QualityGateFactory.create('Desc', 'ledger-unregistered', 0, 0, 0, QualityGateState.CREATED, '1.0.0', '1.0.0', '1.0.0');
    assert(false, 'Should fail for unregistered ledgerId');
  } catch (e: any) {
    assert(e.message.includes('Execution Ledger not registered'), 'Error message mismatch');
  }

  // 3.2 Consistency check (passed = true but critical > 0)
  try {
    // Directly invoking validator with inconsistent object
    const badRecord = {
      gateId: 'gate-2',
      gateVersion: '1.0.0',
      description: 'Bad consistency',
      ledgerId: 'ledger-1',
      criticalCount: 1,
      majorCount: 0,
      minorCount: 0,
      passed: true, // inconsistent
      evaluationState: QualityGateState.EVALUATED,
      evaluationSummary: '1 Critical / 0 Major / 0 Minor',
      ruleVersion: '1.0.0',
      auditSource: 'EXECUTION_LEDGER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    QualityGateValidator.validate(badRecord);
    assert(false, 'Should fail validation for pass consistency error');
  } catch (e: any) {
    assert(e.message.includes('INVALID_GATE_PASS_CONSISTENCY'), 'Error message mismatch');
  }

  // 3.3 State Transition checks
  try {
    QualityGateValidator.validateTransition(QualityGateState.CREATED, QualityGateState.PASSED);
    assert(false, 'CREATED -> PASSED is invalid (must go through EVALUATED)');
  } catch (e: any) {
    assert(e.message.includes('INVALID_GATE_STATE_TRANSITION'), 'Error message mismatch');
  }

  QualityGateValidator.validateTransition(QualityGateState.CREATED, QualityGateState.EVALUATED);
  QualityGateValidator.validateTransition(QualityGateState.EVALUATED, QualityGateState.PASSED);
  QualityGateValidator.validateTransition(QualityGateState.EVALUATED, QualityGateState.FAILED);

  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. Registry State Updates & Pass/Fail Calculations
// ==============================================================================
function testRegistryUpdates() {
  console.log('[Test 4] Registry Updates & Pass/Fail starting...');
  setupAllEnvironments();

  const gate = QualityGateFactory.create(
    'Verify refactoring quality',
    'ledger-1',
    0,
    0,
    0,
    QualityGateState.CREATED,
    '1.0.0',
    '1.0.0',
    '1.0.0'
  );
  QualityGateRegistry.register(gate);

  // Transition: CREATED -> EVALUATED (with 1 Critical violation)
  QualityGateRegistry.updateState(gate.gateId, QualityGateState.EVALUATED, 1, 0, 2);
  
  const evaluatedRecord = QualityGateRegistry.get(gate.gateId)!;
  assert(evaluatedRecord.evaluationState === QualityGateState.EVALUATED, 'State transition failed');
  assert(evaluatedRecord.passed === false, 'Should be failed due to critical count > 0');
  assert(evaluatedRecord.evaluationSummary === '1 Critical / 0 Major / 2 Minor', 'Summary update failed');

  // Transition: EVALUATED -> FAILED
  QualityGateRegistry.updateState(gate.gateId, QualityGateState.FAILED);
  const failedRecord = QualityGateRegistry.get(gate.gateId)!;
  assert(failedRecord.evaluationState === QualityGateState.FAILED, 'FAILED state transition failed');
  assert(failedRecord.passed === false, 'FAILED record passed flag must be false');

  console.log('[Test 4] Registry Updates & Pass/Fail: PASSED');
}

// ==============================================================================
// 5. Adapter & ViewModel Verification
// ==============================================================================
function testAdapter() {
  console.log('[Test 5] Adapter verification starting...');
  setupAllEnvironments();

  const gate = QualityGateFactory.create(
    'Verify documentation quality',
    'ledger-1',
    0,
    0,
    0,
    QualityGateState.CREATED,
    '1.0.0',
    '1.0.0',
    '1.0.0'
  );

  const vm = QualityGateAdapter.toViewModel(gate);
  assert(vm.id === gate.gateId, 'VM ID mismatch');
  assert(vm.evaluationState === 'CREATED', 'State label mismatch');
  assert(vm.summary === '0 Critical / 0 Major / 0 Minor', 'Summary label mismatch');
  assert(vm.passed === true, 'Passed flag mismatch');
  assert(vm.ruleVersionTag === 'rule-v1.0.0', 'Rule version tag mismatch');

  try {
    (vm as any).passed = false;
    assert(false, 'VM should be frozen');
  } catch (e) {
    // OK
  }
  console.log('[Test 5] Adapter verification: PASSED');
}

// ==============================================================================
// 6. DevelopmentRules Integration Verification
// ==============================================================================
function testRulesIntegration() {
  console.log('[Test 6] DevelopmentRules integration verification starting...');
  setupAllEnvironments();

  const gate = QualityGateFactory.create(
    'Verify security quality',
    'ledger-1',
    0,
    0,
    0,
    QualityGateState.CREATED,
    '1.0.0',
    '1.0.0',
    '1.0.0'
  );
  QualityGateRegistry.register(gate);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  const resolvedGate = DevelopmentRules.getQualityGate(rule);

  assert(resolvedGate !== undefined, 'Should resolve quality gate from rule');
  assert(resolvedGate?.gateId === gate.gateId, 'Resolved gate ID mismatch');

  console.log('[Test 6] DevelopmentRules integration verification: PASSED');
}

// ==============================================================================
// Main Runner
// ==============================================================================
function runAllTests() {
  try {
    testMetadata();
    testFactoryAndIds();
    testValidator();
    testRegistryUpdates();
    testAdapter();
    testRulesIntegration();
    console.log('\nAll Quality Gate Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
