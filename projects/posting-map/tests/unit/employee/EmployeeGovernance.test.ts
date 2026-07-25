/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Unit Test Suite for Governance Foundation & Acceptance Criteria
 */

import { describe, expect, it } from 'vitest';
import { AuditTrailLogger } from '../../../src/platform/employee-runtime/audit/AuditTrailLogger';
import { CommandBoundaryGuard } from '../../../src/platform/employee-runtime/guards/CommandBoundaryGuard';
import { InputLockGuard } from '../../../src/platform/employee-runtime/guards/InputLockGuard';
import { ToolPermissionGuard } from '../../../src/platform/employee-runtime/guards/ToolPermissionGuard';
import {
  CommandScope,
  InputLockSpec,
  ToolPermission,
  VerificationReport,
} from '../../../src/platform/employee-runtime/models/EmployeeDomainModels';
import { EmployeeStateMachine } from '../../../src/platform/employee-runtime/state/EmployeeStateMachine';
import { CompletionVerificationEngine } from '../../../src/platform/employee-runtime/verification/CompletionVerificationEngine';

describe('AIOS Basic AI Employee Governance Foundation v1', () => {
  // Acceptance Criterion 1: Blocked when using unlisted Tool
  it('should block execution when an unlisted tool is used', () => {
    const guard = new ToolPermissionGuard();
    const permission: ToolPermission = {
      allowedTools: ['run_command', 'view_file'],
      authorityLevel: 'EXECUTE',
    };

    const res = guard.validateToolUsage(permission, 'unapproved_custom_tool', false);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Tool 'unapproved_custom_tool' is not in allowedTools whitelist");
  });

  // Acceptance Criterion 2: Blocked when referencing unlisted Input / record count mismatch
  it('should block execution when input record count does not match expected count', () => {
    const guard = new InputLockGuard();
    const spec: InputLockSpec = {
      inputSource: 'MIE03_ADDRESS_MASTER.csv',
      fileId: 'MIE03_001',
      checksum: 'abc123hash',
      expectedRecordCount: 858,
    };

    // Simulated actual input from old CSV with 684 records
    const res = guard.validateInput(spec, 'MIE03_ADDRESS_MASTER.csv', 684, 'abc123hash');
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('Record count mismatch. Expected 858 records, got 684 records');
  });

  // Acceptance Criterion 3: Transitions to WAITING_APPROVAL when unlisted Action is attempted
  it('should reject unlisted action and trigger STOP -> WAITING_APPROVAL on FSM', () => {
    const guard = new CommandBoundaryGuard();
    const fsm = new EmployeeStateMachine();

    fsm.transitionTo('ASSIGNED');
    fsm.transitionTo('VALIDATING');

    const scope: CommandScope = {
      taskObjective: 'Generate MIE-03 distribution sheets',
      allowedActions: ['read_csv', 'duplicate_template'],
      forbiddenActions: ['modify_gas_code', 'run_local_simulation_as_final'],
      expectedOutput: '91 area sheets in spreadsheet',
    };

    const res = guard.validateAction(scope, 'custom_unapproved_optimization');
    expect(res.allowed).toBe(false);

    if (!res.allowed) {
      fsm.triggerStopForApproval(res.reason || 'Unlisted action');
    }

    expect(fsm.getState()).toBe('WAITING_APPROVAL');
  });

  // Acceptance Criterion 4: SIMULATED state cannot directly transition to COMPLETED
  it('should reject completion transition if completion level is SIMULATED', () => {
    const engine = new CompletionVerificationEngine();
    const report: VerificationReport = {
      physicalRecordCount: 858,
      sheetNames: ['桑名市', 'いなべ市'],
      diffSummary: '0 diff',
      isVerified: true,
      completionLevel: 'SIMULATED',
    };

    const res = engine.verifyCompletion(report);
    expect(res.canComplete).toBe(false);
    expect(res.reason).toContain("Cannot transition directly to COMPLETED from 'SIMULATED' status");
  });

  // Acceptance Criterion 5: EXECUTE authority level prohibits code modification
  it('should prohibit code modification under EXECUTE authority level', () => {
    const guard = new ToolPermissionGuard();
    const permission: ToolPermission = {
      allowedTools: ['replace_file_content', 'write_to_file'],
      authorityLevel: 'EXECUTE',
    };

    const res = guard.validateToolUsage(permission, 'replace_file_content', true);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Code modification requires 'MODIFY' authority level");
  });

  // Audit Trail Logger Verification
  it('should record immutable audit trail entries correctly', () => {
    const logger = new AuditTrailLogger();
    logger.logEvent({
      taskId: 'TASK-MIE03-01',
      employeeId: 'EMP-GOV-01',
      command: 'Generate Area Sheets',
      inputSpec: {
        inputSource: 'MIE03_ADDRESS_MASTER.csv',
        fileId: 'MIE03_001',
        checksum: 'hash',
        expectedRecordCount: 858,
      },
      toolUsed: 'run_command',
      actionTaken: 'validateInput',
      resultStatus: 'VALIDATING',
      timestamp: '2026-07-26T03:53:00Z',
      approvalState: 'APPROVED',
    });

    const logs = logger.getLogs('TASK-MIE03-01');
    expect(logs.length).toBe(1);
    expect(logs[0].expectedRecordCount || logs[0].inputSpec.expectedRecordCount).toBe(858);
  });
});
