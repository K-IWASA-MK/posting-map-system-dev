/**
 * AIOS Employee Communication Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EmployeeCommunicationEngine } from '../../../src/platform/employee-runtime/communication/EmployeeCommunicationEngine';
import { NotificationGateway } from '../../../src/platform/employee-runtime/communication/NotificationGateway';
import { ApprovalRequestManager } from '../../../src/platform/employee-runtime/communication/ApprovalRequestManager';

describe('AIOS Employee Communication Foundation', () => {
  // Scenario 1: Notification Generation with Tamper Hash & Priority
  it('should generate Notification with tamper-detection hash and deterministic priority', () => {
    const gateway = new NotificationGateway();

    // 1. Policy Violation Notification -> CRITICAL
    const ntf1 = gateway.createNotification('GovernancePolicy', 'POLICY_VIOLATION', 'Forbidden action modify_gas_code requested');
    expect(ntf1.priority).toBe('CRITICAL');
    expect(ntf1.notificationHash).toContain('HASH-');

    // 2. Workflow Completed Notification -> INFO
    const ntf2 = gateway.createNotification('WorkflowOrchestration', 'WORKFLOW_COMPLETED', 'District Initialization completed cleanly');
    expect(ntf2.priority).toBe('INFO');
    expect(ntf2.notificationHash).toContain('HASH-');
  });

  // Scenario 2: Approval Request Generation & Fixed State Machine
  it('should manage ApprovalRequest state machine and reject backward transitions', () => {
    const manager = new ApprovalRequestManager();
    const req = manager.createApprovalRequest('TASK-MIE03-01', 'EMP-MIE03-01', 'Scope outside action requested');

    expect(req.status).toBe('WAITING');

    // Transition to APPROVED -> SUCCESS
    const approved = manager.updateApprovalStatus(req.approvalRequestId, 'APPROVED');
    expect(approved.status).toBe('APPROVED');

    // Backward transition attempt (APPROVED -> REJECTED or WAITING) -> MUST FAIL
    expect(() =>
      manager.updateApprovalStatus(req.approvalRequestId, 'REJECTED')
    ).toThrow(/Cannot transition ApprovalRequest .* from final status 'APPROVED' to 'REJECTED'/);
  });

  // Scenario 3: Human Response Processing & Identity Verification
  it('should process human response from valid user and reject AI agent self-approval', () => {
    const engine = new EmployeeCommunicationEngine();
    const req = engine.requestApproval('TASK-MIE03-01', 'EMP-MIE03-01', 'High risk operation');

    // 1. AI Agent (EMP-MIE03-01) approval attempt -> MUST FAIL (UNAUTHORIZED)
    expect(() =>
      engine.handleHumanResponse(req.approvalRequestId, 'EMP-MIE03-01', 'APPROVE', 'Self approval attempt')
    ).toThrow(/AI Agents cannot approve or resolve ApprovalRequests/);

    // 2. Human Administrator (ADMIN-CEO) approval attempt -> SUCCESS (AUTHORIZED)
    const response = engine.handleHumanResponse(req.approvalRequestId, 'ADMIN-CEO', 'APPROVE', 'Approved by CEO');
    expect(response.authorizationStatus).toBe('AUTHORIZED');
    expect(response.action).toBe('APPROVE');
  });

  // Scenario 4: Notification Immutability & Property Mutation Rejection
  it('should reject direct property mutation of NotificationRecord', () => {
    const gateway = new NotificationGateway();
    const ntf = gateway.createNotification('ExecutionRuntime', 'EXECUTION_START', 'Execution started');

    // Property mutation attempt must throw
    expect(() => {
      (ntf as any).priority = 'INFO';
    }).toThrow();
  });

  // Scenario 5: Immutable Communication Audit Trail Logging
  it('should record audit trail for notifications, approval requests, and human responses', () => {
    const engine = new EmployeeCommunicationEngine();
    const ntf = engine.sendNotification('Workflow', 'WORKFLOW_STARTED', 'Workflow started');
    const req = engine.requestApproval('TASK-MIE03-01', 'EMP-MIE03-01', 'Scope check');
    engine.handleHumanResponse(req.approvalRequestId, 'ADMIN-CEO', 'APPROVE');

    const ntfLogs = engine.getAuditLogs(ntf.notificationId);
    expect(ntfLogs.length).toBe(1);
    expect(ntfLogs[0].messageType).toBe('NOTIFICATION');

    const reqLogs = engine.getAuditLogs(req.approvalRequestId);
    expect(reqLogs.length).toBe(1);
    expect(reqLogs[0].messageType).toBe('APPROVAL_REQUEST');
  });
});
