/**
 * AIOS Employee Communication Foundation
 * Approval Request Manager Implementation (Fixed State Machine: REQUESTED -> WAITING -> APPROVED/REJECTED)
 */

import { IApprovalRequestManager } from './contract/IEmployeeCommunication';
import { ApprovalRequest, ApprovalRequestStatus } from './models/EmployeeCommunicationModels';

export class ApprovalRequestManager implements IApprovalRequestManager {
  private requests: Map<string, ApprovalRequest> = new Map();

  public createApprovalRequest(
    taskId: string,
    employeeId: string,
    reason: string,
    workflowId?: string
  ): ApprovalRequest {
    const timestamp = new Date().toISOString();
    const requestId = `APR-${taskId}-${Date.now()}`;

    const record: ApprovalRequest = Object.freeze({
      approvalRequestId: requestId,
      taskId: taskId,
      workflowId: workflowId,
      employeeId: employeeId,
      reason: reason,
      status: 'WAITING', // Transitions directly from REQUESTED to WAITING
      requestedAt: timestamp,
    });

    this.requests.set(requestId, record);
    return record;
  }

  public updateApprovalStatus(
    approvalRequestId: string,
    newStatus: 'APPROVED' | 'REJECTED'
  ): ApprovalRequest {
    const current = this.getApprovalRequest(approvalRequestId);

    // Fixed State Machine Check (Additional Requirement 3)
    if (current.status === 'APPROVED' || current.status === 'REJECTED') {
      throw new Error(
        `[Approval Request Manager Block] Cannot transition ApprovalRequest '${approvalRequestId}' from final status '${current.status}' to '${newStatus}' (Backward transition forbidden).`
      );
    }

    const updated: ApprovalRequest = Object.freeze({
      ...current,
      status: newStatus,
    });

    this.requests.set(approvalRequestId, updated);
    return updated;
  }

  public getApprovalRequest(approvalRequestId: string): ApprovalRequest {
    const req = this.requests.get(approvalRequestId);
    if (!req) {
      throw new Error(`[Approval Request Manager Block] ApprovalRequestId '${approvalRequestId}' not found.`);
    }
    return req;
  }
}
