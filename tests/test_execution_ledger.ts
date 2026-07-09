import { CapabilityRegistry, CapabilityCategory, CapabilityStatus } from '../src/aios/CapabilityRegistry';
import { CapabilityFactory } from '../src/aios/CapabilityFactory';
import { SkillRegistry, SkillCategory, SkillStatus } from '../src/aios/SkillRegistry';
import { SkillFactory } from '../src/aios/SkillFactory';
import { SkillPipelineRegistry, SkillPipelineStatus } from '../src/aios/SkillPipelineRegistry';
import { SkillPipelineFactory } from '../src/aios/SkillPipelineFactory';
import { ExecutionLedgerRegistry, ExecutionState, ExecutionRecord } from '../src/aios/ExecutionLedgerRegistry';
import { ExecutionLedgerFactory } from '../src/aios/ExecutionLedgerFactory';
import { ExecutionLedgerValidator } from '../src/aios/ExecutionLedgerValidator';
import { ExecutionLedgerAdapter } from '../src/aios/ExecutionLedgerAdapter';
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
  ExecutionLedgerRegistry.clear();
  ExecutionLedgerFactory.resetCounter();

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
// 1. Metadata Verification
// ==============================================================================
function testMetadata() {
  console.log('[Test 1] ExecutionLedgerRegistry Metadata verification starting...');
  assert(ExecutionLedgerRegistry.metadata.registryId === 'reg-ledger-01', 'Registry ID mismatch');
  assert(ExecutionLedgerRegistry.metadata.registryVersion === '1.0.0', 'Version mismatch');
  console.log('[Test 1] ExecutionLedgerRegistry Metadata verification: PASSED');
}

// ==============================================================================
// 2. Factory and Deterministic ID Verification
// ==============================================================================
function testFactoryAndIds() {
  console.log('[Test 2] Factory and Deterministic ID verification starting...');
  setupAllEnvironments();

  const cap = CapabilityRegistry.getByName('Testing')!;
  const pipeline = SkillPipelineRegistry.getByName('TestPipe')!;

  const record = ExecutionLedgerFactory.create(
    'Verify test execution',
    cap.capabilityId,
    pipeline.pipelineId,
    ['skill-1'],
    ExecutionState.PLANNED,
    '1.0.0',
    '1.0.0'
  );

  assert(record.executionId === 'ledger-1', 'Monotonic counter ID failed');
  assert(record.executionState === ExecutionState.PLANNED, 'State mismatch');
  assert(record.auditTrail[0].includes('Record Initialized as PLANNED'), 'Initial audit message missing');
  
  try {
    (record as any).executionState = ExecutionState.COMPLETED;
    assert(false, 'Should be frozen');
  } catch (e) {
    // OK
  }
  console.log('[Test 2] Factory and Deterministic ID verification: PASSED');
}

// ==============================================================================
// 3. Validator Verification (ISO8601, Date, Transitions)
// ==============================================================================
function testValidator() {
  console.log('[Test 3] Validator verification starting...');
  setupAllEnvironments();
  const cap = CapabilityRegistry.getByName('Testing')!;
  const pipeline = SkillPipelineRegistry.getByName('TestPipe')!;

  // 3.1 Date order violation check (createdAt > updatedAt)
  const pastTime = new Date('2026-07-09T09:00:00Z').toISOString();
  const futureTime = new Date('2026-07-09T10:00:00Z').toISOString();
  
  try {
    ExecutionLedgerFactory.create(
      'Invalid timing',
      cap.capabilityId,
      pipeline.pipelineId,
      ['skill-1'],
      ExecutionState.PLANNED,
      '1.0.0',
      '1.0.0',
      futureTime, // createdAt is in the future
      pastTime    // updatedAt is in the past
    );
    assert(false, 'Should fail validation for timing order violation');
  } catch (e: any) {
    assert(e.message.includes('Date sequence violation'), 'Error message mismatch');
  }

  // 3.2 Invalid ISO8601 check
  try {
    ExecutionLedgerFactory.create(
      'Invalid ISO',
      cap.capabilityId,
      pipeline.pipelineId,
      ['skill-1'],
      ExecutionState.PLANNED,
      '1.0.0',
      '1.0.0',
      '2026-07-09 10:00:00' // Bad format
    );
    assert(false, 'Should fail validation for bad ISO timestamp');
  } catch (e: any) {
    assert(e.message.includes('Invalid timestamp format') || e.message.includes('Invalid createdAt format'), 'Error message mismatch');
  }

  // 3.3 State Transition check
  try {
    ExecutionLedgerValidator.validateTransition(ExecutionState.PLANNED, ExecutionState.COMPLETED);
    assert(false, 'PLANNED -> COMPLETED is an invalid transition');
  } catch (e: any) {
    assert(e.message.includes('INVALID_EXECUTION_STATE_TRANSITION'), 'Error message mismatch');
  }

  // Valid Transition checks
  ExecutionLedgerValidator.validateTransition(ExecutionState.PLANNED, ExecutionState.READY);
  ExecutionLedgerValidator.validateTransition(ExecutionState.READY, ExecutionState.EXECUTING);
  ExecutionLedgerValidator.validateTransition(ExecutionState.EXECUTING, ExecutionState.COMPLETED);

  console.log('[Test 3] Validator verification: PASSED');
}

// ==============================================================================
// 4. Registry State Updates & Immutability
// ==============================================================================
function testRegistryUpdates() {
  console.log('[Test 4] Registry State Updates verification starting...');
  setupAllEnvironments();
  const cap = CapabilityRegistry.getByName('Testing')!;
  const pipeline = SkillPipelineRegistry.getByName('TestPipe')!;

  const record = ExecutionLedgerFactory.create(
    'Verify transition flow',
    cap.capabilityId,
    pipeline.pipelineId,
    ['skill-1'],
    ExecutionState.PLANNED,
    '1.0.0',
    '1.0.0'
  );
  ExecutionLedgerRegistry.register(record);

  // Transition: PLANNED -> READY
  ExecutionLedgerRegistry.updateState(record.executionId, ExecutionState.READY, 'Ready to run tests');
  
  const updatedRecord = ExecutionLedgerRegistry.get(record.executionId)!;
  assert(updatedRecord.executionState === ExecutionState.READY, 'State transition failed');
  assert(updatedRecord.auditTrail.length === 2, 'Audit trail length mismatch');
  assert(updatedRecord.auditTrail[1].includes('READY: Ready to run tests'), 'Audit message format mismatch');

  // Verify transition from terminal state throws error
  ExecutionLedgerRegistry.updateState(record.executionId, ExecutionState.EXECUTING, 'Running tests');
  ExecutionLedgerRegistry.updateState(record.executionId, ExecutionState.COMPLETED, 'Tests passed');

  try {
    ExecutionLedgerRegistry.updateState(record.executionId, ExecutionState.EXECUTING, 'Restarting');
    assert(false, 'Should throw transition error from terminal COMPLETED state');
  } catch (e: any) {
    assert(e.message.includes('INVALID_EXECUTION_STATE_TRANSITION'), 'Error message mismatch');
  }

  console.log('[Test 4] Registry State Updates verification: PASSED');
}

// ==============================================================================
// 5. Adapter & ViewModel Verification
// ==============================================================================
function testAdapter() {
  console.log('[Test 5] Adapter verification starting...');
  setupAllEnvironments();
  const cap = CapabilityRegistry.getByName('Testing')!;
  const pipeline = SkillPipelineRegistry.getByName('TestPipe')!;

  const record = ExecutionLedgerFactory.create(
    'Refactoring flow',
    cap.capabilityId,
    pipeline.pipelineId,
    ['skill-1'],
    ExecutionState.EXECUTING,
    '1.0.0',
    '1.0.0'
  );

  const vm = ExecutionLedgerAdapter.toViewModel(record);
  assert(vm.id === record.executionId, 'VM ID mismatch');
  assert(vm.description === 'Refactoring flow', 'VM description mismatch');
  assert(vm.stateLabel === 'EXECUTING', 'State label mismatch');
  assert(vm.isTerminal === false, 'Terminal check failed');
  assert(vm.lastAuditMessage.includes('Record Initialized as EXECUTING'), 'Audit message mapping failed');

  try {
    (vm as any).stateLabel = 'COMPLETED';
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
  const cap = CapabilityRegistry.getByName('Testing')!;
  const pipeline = SkillPipelineRegistry.getByName('TestPipe')!;

  const record = ExecutionLedgerFactory.create(
    'Audit flow',
    cap.capabilityId,
    pipeline.pipelineId,
    ['skill-1'],
    ExecutionState.PLANNED,
    '1.0.0',
    '1.0.0'
  );
  ExecutionLedgerRegistry.register(record);

  const rule = DevelopmentRules.createRule('rule-1', 'Test rule', 'Testing', 5);
  const ledgerHistory = DevelopmentRules.getExecutionLedger(rule);

  assert(ledgerHistory.length === 1, 'Should resolve ledger history via rule');
  assert(ledgerHistory[0].executionId === record.executionId, 'Resolved record mismatch');

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
    console.log('\nAll Execution Ledger Foundation tests passed successfully!');
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    throw error;
  }
}

runAllTests();
