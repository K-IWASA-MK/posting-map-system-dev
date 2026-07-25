/**
 * AIOS Employee Governance Enforcement Runtime Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EmployeeGovernanceEnforcementEngine } from '../../../src/platform/employee-runtime/enforcement/EmployeeGovernanceEnforcementEngine';
import { EnforcementRequest } from '../../../src/platform/employee-runtime/enforcement/models/EmployeeEnforcementModels';
import { DecisionRecord } from '../../../src/platform/employee-runtime/decision/models/EmployeeDecisionModels';

describe('AIOS Employee Governance Enforcement Runtime Foundation', () => {
  const allowedDecision: DecisionRecord = {
    decisionId: 'DEC-MIE03-01',
    requestId: 'REQ-DEC-001',
    taskId: 'TASK-MIE03-01',
    employeeId: 'EMP-MIE03-01',
    status: 'ALLOWED',
    riskLevel: 'LOW',
    approvalStatus: 'NOT_REQUIRED',
    appliedPolicies: ['GOVERNANCE_SYSTEM_POLICY'],
    reason: 'All checks passed cleanly',
    evaluatedAt: '2026-07-26T04:40:00Z',
  };

  const deniedDecision: DecisionRecord = {
    decisionId: 'DEC-MIE03-DENIED',
    requestId: 'REQ-DEC-002',
    taskId: 'TASK-MIE03-01',
    employeeId: 'EMP-MIE03-01',
    status: 'DENIED',
    riskLevel: 'CRITICAL',
    approvalStatus: 'REJECTED',
    appliedPolicies: ['sys_command_policy_v1'],
    reason: 'System policy forbidden action modify_gas_code',
    evaluatedAt: '2026-07-26T04:40:00Z',
  };

  const waitingApprovalDecision: DecisionRecord = {
    decisionId: 'DEC-MIE03-WAITING',
    requestId: 'REQ-DEC-003',
    taskId: 'TASK-MIE03-01',
    employeeId: 'EMP-MIE03-01',
    status: 'WAITING_APPROVAL',
    riskLevel: 'HIGH',
    approvalStatus: 'REQUIRED',
    appliedPolicies: ['COMMAND_SCOPE_POLICY'],
    reason: 'Scope outside action requires human approval',
    evaluatedAt: '2026-07-26T04:40:00Z',
  };

  // Scenario 1: Normal ALLOWED Flow -> PASS
  it('should permit execution when Decision is ALLOWED and tool is whitelisted', () => {
    const engine = new EmployeeGovernanceEnforcementEngine();
    const req: EnforcementRequest = {
      requestId: 'REQ-ENF-001',
      decisionRecord: allowedDecision,
      toolName: 'duplicate_sheet_tool',
      allowedToolsWhitelist: ['run_command', 'duplicate_sheet_tool'],
    };

    const record = engine.enforce(req);
    expect(record.gateResult).toBe('PASS');
    expect(record.status).toBe('ALLOWED');
  });

  // Scenario 2: DENIED Decision -> BLOCK
  it('should BLOCK execution when Decision is DENIED', () => {
    const engine = new EmployeeGovernanceEnforcementEngine();
    const req: EnforcementRequest = {
      requestId: 'REQ-ENF-002',
      decisionRecord: deniedDecision,
    };

    const record = engine.enforce(req);
    expect(record.gateResult).toBe('BLOCK');
    expect(record.status).toBe('BLOCKED');
    expect(record.blockedReason).toContain('Execution BLOCKED because Decision status is DENIED');
  });

  // Scenario 3: WAITING_APPROVAL Decision without Human Authorization -> BLOCK
  it('should BLOCK execution for WAITING_APPROVAL Decision when authorizedByHuman is false or missing', () => {
    const engine = new EmployeeGovernanceEnforcementEngine();
    const req: EnforcementRequest = {
      requestId: 'REQ-ENF-003',
      decisionRecord: waitingApprovalDecision,
      authorizedByHuman: false,
    };

    const record = engine.enforce(req);
    expect(record.gateResult).toBe('BLOCK');
    expect(record.status).toBe('WAITING_APPROVAL');
    expect(record.blockedReason).toContain('Decision requires explicit human authorization');
  });

  // Scenario 4: Tool Gate Independent Validation -> BLOCK when Tool is Unapproved
  it('should BLOCK execution when tool is NOT in whitelist, even if Decision status is ALLOWED', () => {
    const engine = new EmployeeGovernanceEnforcementEngine();
    const req: EnforcementRequest = {
      requestId: 'REQ-ENF-004',
      decisionRecord: allowedDecision,
      toolName: 'unapproved_custom_tool',
      allowedToolsWhitelist: ['run_command', 'duplicate_sheet_tool'],
    };

    const record = engine.enforce(req);
    expect(record.gateResult).toBe('BLOCK');
    expect(record.status).toBe('BLOCKED');
    expect(record.blockedReason).toContain("Tool 'unapproved_custom_tool' is NOT present in allowedTools whitelist");
  });

  // Scenario 5: Audit Trail Verification for BOTH PASS and BLOCK Events
  it('should record audit logs for both PASS and BLOCK enforcement events', () => {
    const engine = new EmployeeGovernanceEnforcementEngine();

    // 1. Enforce ALLOWED (PASS)
    const passRecord = engine.enforce({
      requestId: 'REQ-ENF-PASS',
      decisionRecord: allowedDecision,
      toolName: 'run_command',
      allowedToolsWhitelist: ['run_command'],
    });

    // 2. Enforce DENIED (BLOCK)
    const blockRecord = engine.enforce({
      requestId: 'REQ-ENF-BLOCK',
      decisionRecord: deniedDecision,
    });

    const passLogs = engine.getAuditLogs(passRecord.enforcementId);
    expect(passLogs.length).toBe(1);
    expect(passLogs[0].enforcementResult).toBe('PASS');

    const blockLogs = engine.getAuditLogs(blockRecord.enforcementId);
    expect(blockLogs.length).toBe(1);
    expect(blockLogs[0].enforcementResult).toBe('BLOCK');
    expect(blockLogs[0].blockedReason).toContain('DENIED');
  });

  // Scenario 6: Enforcement Record Immutability Verification
  it('should reject direct property mutation of EnforcementRecord', () => {
    const engine = new EmployeeGovernanceEnforcementEngine();
    const record = engine.enforce({
      requestId: 'REQ-ENF-MUT',
      decisionRecord: allowedDecision,
    });

    // Mutation attempt must throw
    expect(() => {
      (record as any).gateResult = 'PASS';
    }).toThrow();
  });
});
