/**
 * AIOS Employee Governance Decision Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EmployeeGovernanceDecisionEngine } from '../../../src/platform/employee-runtime/decision/EmployeeGovernanceDecisionEngine';
import { DecisionContext } from '../../../src/platform/employee-runtime/decision/models/EmployeeDecisionModels';
import { TaskRecord } from '../../../src/platform/employee-runtime/task-assignment/models/TaskAssignmentModels';
import { PolicyEvaluationResult } from '../../../src/platform/employee-runtime/policy/models/EmployeePolicyModels';

describe('AIOS Employee Governance Decision Foundation', () => {
  const approvedTask: TaskRecord = {
    taskId: 'TASK-DEC-MIE03-01',
    taskName: 'MIE-03 Area Sheet Batch Generation',
    taskType: 'DISTRICT_SHEET_GENERATION',
    description: 'Execute batch generation for Mie 3rd District',
    createdAt: '2026-07-26T04:35:00Z',
    assignedEmployeeId: 'EMP-MIE03-01',
    assignedRoleId: 'ROLE_DISTRICT_OPS',
    scope: {
      taskObjective: 'Generate MIE-03 distribution area sheets',
      allowedActions: ['duplicate_template', 'insert_address'],
      forbiddenActions: ['modify_gas_code'],
      expectedOutput: '91 area sheets in spreadsheet',
    },
    inputSpec: {
      inputSource: 'MIE03_ADDRESS_MASTER.csv',
      fileId: 'MIE03_MASTER_858',
      checksum: 'sha256_hash_858',
      expectedRecordCount: 858,
    },
    allowedTools: ['run_command', 'duplicate_sheet_tool'],
    status: 'READY',
    approvalStatus: 'APPROVED',
  };

  const allowedPolicyResult: PolicyEvaluationResult = {
    requestId: 'REQ-POL-001',
    status: 'ALLOWED',
    reason: 'Policy check passed',
    evaluatedAt: '2026-07-26T04:35:00Z',
  };

  const deniedPolicyResult: PolicyEvaluationResult = {
    requestId: 'REQ-POL-002',
    status: 'DENIED',
    reason: '[Policy Block] System policy forbidden action modify_gas_code',
    violationCode: 'ACTION_FORBIDDEN',
    appliedPolicyId: 'sys_command_policy_v1',
    evaluatedAt: '2026-07-26T04:35:00Z',
  };

  const validContext: DecisionContext = {
    taskContract: approvedTask,
    employeeId: 'EMP-MIE03-01',
    policyResult: allowedPolicyResult,
    actualSource: 'MIE03_ADDRESS_MASTER.csv',
    actualRecordCount: 858,
    actualChecksum: 'sha256_hash_858',
    toolRequested: 'duplicate_sheet_tool',
    requestedAction: 'duplicate_template',
  };

  // Scenario 1: Normal ALLOWED Flow
  it('should return ALLOWED status for valid task, input, tool, and policy', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const decision = engine.makeDecision('REQ-001', validContext);

    expect(decision.status).toBe('ALLOWED');
    expect(decision.riskLevel).toBe('LOW');
    expect(decision.approvalStatus).toBe('NOT_REQUIRED');
  });

  // Scenario 2: Policy DENIED Flow (SYSTEM DENIED overrides lower ALLOWED)
  it('should return DENIED status when Policy result is DENIED', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const deniedContext: DecisionContext = {
      ...validContext,
      policyResult: deniedPolicyResult,
      requestedAction: 'modify_gas_code',
    };

    const decision = engine.makeDecision('REQ-002', deniedContext);

    expect(decision.status).toBe('DENIED');
    expect(decision.riskLevel).toBe('CRITICAL');
    expect(decision.approvalStatus).toBe('REJECTED');
    expect(decision.reason).toContain('modify_gas_code');
  });

  // Scenario 3: Input Lock Record Mismatch (858 vs 684) DENIED Flow
  it('should return DENIED when actual record count (684) does not match expected (858)', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const mismatchContext: DecisionContext = {
      ...validContext,
      actualRecordCount: 684, // Mismatch!
    };

    const decision = engine.makeDecision('REQ-003', mismatchContext);

    expect(decision.status).toBe('DENIED');
    expect(decision.riskLevel).toBe('HIGH');
    expect(decision.reason).toContain('Record count mismatch. Expected 858 records, got 684 records. Execution DENIED.');
  });

  // Scenario 4: Unapproved Tool Requested DENIED Flow
  it('should return DENIED when an unlisted tool is requested', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const unapprovedToolContext: DecisionContext = {
      ...validContext,
      toolRequested: 'unapproved_custom_script_tool',
    };

    const decision = engine.makeDecision('REQ-004', unapprovedToolContext);

    expect(decision.status).toBe('DENIED');
    expect(decision.riskLevel).toBe('HIGH');
    expect(decision.reason).toContain("Tool 'unapproved_custom_script_tool' is not in allowedTools whitelist");
  });

  // Scenario 5: Scope Outside Action WAITING_APPROVAL Flow
  it('should return WAITING_APPROVAL when Scope outside action is requested', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const scopeOutsideContext: DecisionContext = {
      ...validContext,
      requestedAction: 'unauthorized_action_outside_scope',
    };

    const decision = engine.makeDecision('REQ-005', scopeOutsideContext);

    expect(decision.status).toBe('WAITING_APPROVAL');
    expect(decision.riskLevel).toBe('HIGH');
    expect(decision.approvalStatus).toBe('REQUIRED');
  });

  // Scenario 6: Rejection of Automated Approval Transition & Human Resolution Flow
  it('should block automated approval resolution without human authorization, and allow human resolution', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const scopeOutsideContext: DecisionContext = {
      ...validContext,
      requestedAction: 'unauthorized_action_outside_scope',
    };

    const decision = engine.makeDecision('REQ-006', scopeOutsideContext);
    expect(decision.status).toBe('WAITING_APPROVAL');

    // Automated resolution attempt (authorizedByHuman: false) -> MUST FAIL
    expect(() =>
      engine.resolveHumanApproval(decision.decisionId, false)
    ).toThrow(/Automated transition of Decision .* to 'APPROVED' is strictly forbidden/);

    // Human authorized resolution -> SUCCESS
    const approvedDecision = engine.resolveHumanApproval(decision.decisionId, true);
    expect(approvedDecision.status).toBe('ALLOWED');
    expect(approvedDecision.approvalStatus).toBe('APPROVED');
  });

  // Scenario 7: Decision Record Mutation Rejection (Immutability)
  it('should reject direct property mutation of DecisionRecord', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const decision = engine.makeDecision('REQ-007', validContext);

    // Mutation attempt must throw
    expect(() => {
      (decision as any).status = 'DENIED';
    }).toThrow();
  });

  // Scenario 8: Decision Audit Trail Verification
  it('should record audit trail for decision generation and human approval', () => {
    const engine = new EmployeeGovernanceDecisionEngine();
    const decision = engine.makeDecision('REQ-008', validContext);

    const logs = engine.getAuditLogs(decision.decisionId);
    expect(logs.length).toBe(1);
    expect(logs[0].decisionStatus).toBe('ALLOWED');
    expect(logs[0].riskLevel).toBe('LOW');
  });
});
