/**
 * test_governance_audit_trigger.ts
 * 
 * Unit Test Suite for Sprint G10-4: Governance Audit Trigger Foundation.
 * Verifies deterministic reaudit evaluation and immutable report generation:
 * - Constitution Change -> REQUIRES_REAUDIT
 * - Enforcement Change -> REQUIRES_REAUDIT
 * - Runtime Integration Change -> REQUIRES_REAUDIT
 * - Retention Category Change -> REQUIRES_REAUDIT
 * - Multiple Governance Changes -> REQUIRES_REAUDIT (with MULTIPLE_GOVERNANCE_CHANGES_DETECTED reason)
 * - Documentation Only -> NO_REAUDIT_REQUIRED
 * - Test Only -> NO_REAUDIT_REQUIRED
 */

import { 
  GovernanceAuditTrigger, 
  GovernanceImpactTypes, 
  GovernanceAuditReasons, 
  GovernanceAuditDecisions 
} from '../../../src/constitution';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function test1_ConstitutionChangeReaudit() {
  console.log('[Test 1] Constitution Change Reaudit Verification...');
  
  const report = GovernanceAuditTrigger.evaluateImpact({
    impactTypes: [GovernanceImpactTypes.CONSTITUTION_CHANGE],
    affectedModules: ['src/constitution/ConstitutionPrinciple.ts']
  });

  assert(report.decision === GovernanceAuditDecisions.REQUIRES_REAUDIT, 'Constitution change must trigger REQUIRES_REAUDIT');
  assert(report.reasons.includes(GovernanceAuditReasons.CONSTITUTION_MODIFIED), 'Reason must include Constitution Modified');
  assert(report.primaryImpactType === 'CONSTITUTION_CHANGE', 'Primary impact type must be CONSTITUTION_CHANGE');
  console.log('✓ Test 1 Passed');
}

async function test2_EnforcementChangeReaudit() {
  console.log('[Test 2] Enforcement Change Reaudit Verification...');
  
  const report = GovernanceAuditTrigger.evaluateImpact({
    impactTypes: [GovernanceImpactTypes.ENFORCEMENT_CHANGE],
    affectedModules: ['src/constitution/enforcement/ConstitutionEnforcement.ts']
  });

  assert(report.decision === GovernanceAuditDecisions.REQUIRES_REAUDIT, 'Enforcement change must trigger REQUIRES_REAUDIT');
  assert(report.reasons.includes(GovernanceAuditReasons.ENFORCEMENT_LOGIC_CHANGED), 'Reason must include Enforcement Logic Changed');
  console.log('✓ Test 2 Passed');
}

async function test3_RuntimeIntegrationChangeReaudit() {
  console.log('[Test 3] Runtime Integration Change Reaudit Verification...');
  
  const report = GovernanceAuditTrigger.evaluateImpact({
    impactTypes: [GovernanceImpactTypes.RUNTIME_INTEGRATION_CHANGE],
    affectedModules: ['src/runtime/constitution/ConstitutionRuntimeGate.ts']
  });

  assert(report.decision === GovernanceAuditDecisions.REQUIRES_REAUDIT, 'Runtime integration change must trigger REQUIRES_REAUDIT');
  assert(report.reasons.includes(GovernanceAuditReasons.RUNTIME_BOUNDARY_CHANGED), 'Reason must include Runtime Boundary Changed');
  console.log('✓ Test 3 Passed');
}

async function test4_RetentionCategoryChangeReaudit() {
  console.log('[Test 4] Retention Category Change Reaudit Verification...');
  
  const report = GovernanceAuditTrigger.evaluateImpact({
    impactTypes: [GovernanceImpactTypes.RETENTION_CATEGORY_CHANGE],
    affectedModules: ['src/constitution/enforcement/SkillRetentionValidator.ts']
  });

  assert(report.decision === GovernanceAuditDecisions.REQUIRES_REAUDIT, 'Retention category change must trigger REQUIRES_REAUDIT');
  assert(report.reasons.includes(GovernanceAuditReasons.RETENTION_MATRIX_MODIFIED), 'Reason must include Retention Matrix Modified');
  console.log('✓ Test 4 Passed');
}

async function test5_MultipleGovernanceChanges() {
  console.log('[Test 5] Multiple Governance Changes Verification...');
  
  const report = GovernanceAuditTrigger.evaluateImpact({
    impactTypes: [
      GovernanceImpactTypes.CONSTITUTION_CHANGE,
      GovernanceImpactTypes.ENFORCEMENT_CHANGE,
      GovernanceImpactTypes.RUNTIME_INTEGRATION_CHANGE
    ],
    affectedModules: [
      'src/constitution/ConstitutionPrinciple.ts',
      'src/constitution/enforcement/ConstitutionEnforcement.ts',
      'src/runtime/constitution/ConstitutionRuntimeGate.ts'
    ]
  });

  assert(report.decision === GovernanceAuditDecisions.REQUIRES_REAUDIT, 'Multiple governance changes must trigger REQUIRES_REAUDIT');
  assert(report.primaryImpactType === 'MULTIPLE_GOVERNANCE_CHANGES', 'Primary impact type must be MULTIPLE_GOVERNANCE_CHANGES');
  assert(report.reasons.includes(GovernanceAuditReasons.MULTIPLE_GOVERNANCE_CHANGES_DETECTED), 'Reason must include Multiple Governance Changes Detected');
  assert(report.impactTypes.includes('MULTIPLE_GOVERNANCE_CHANGES'), 'impactTypes must contain MULTIPLE_GOVERNANCE_CHANGES');
  console.log('✓ Test 5 Passed');
}

async function test6_NonGovernanceChanges() {
  console.log('[Test 6] Non-governance Changes (Doc & Test Only) Verification...');
  
  const docReport = GovernanceAuditTrigger.evaluateImpact({
    impactTypes: [GovernanceImpactTypes.DOCUMENTATION_ONLY],
    affectedModules: ['README.md']
  });

  assert(docReport.decision === GovernanceAuditDecisions.NO_REAUDIT_REQUIRED, 'Documentation change must trigger NO_REAUDIT_REQUIRED');
  assert(docReport.reasons.includes(GovernanceAuditReasons.NON_GOVERNANCE_CHANGE), 'Reason must include Non-governance Change');

  const testReport = GovernanceAuditTrigger.evaluateImpact({
    impactTypes: [GovernanceImpactTypes.TEST_ONLY],
    affectedModules: ['tests/unit/typescript/test_governance_audit_trigger.ts']
  });

  assert(testReport.decision === GovernanceAuditDecisions.NO_REAUDIT_REQUIRED, 'Test change must trigger NO_REAUDIT_REQUIRED');
  console.log('✓ Test 6 Passed');
}

async function runAllTests() {
  console.log('=== Sprint G10-4: Governance Audit Trigger Test Suite ===');
  await test1_ConstitutionChangeReaudit();
  await test2_EnforcementChangeReaudit();
  await test3_RuntimeIntegrationChangeReaudit();
  await test4_RetentionCategoryChangeReaudit();
  await test5_MultipleGovernanceChanges();
  await test6_NonGovernanceChanges();
  console.log('=== All Governance Audit Trigger Tests Passed Successfully! ===');
}

runAllTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
