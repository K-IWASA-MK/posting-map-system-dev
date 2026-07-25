/**
 * AIOS Employee Communication Foundation
 * Human Response Handler Implementation (Identity Verification & Audit)
 */

import { ApprovalRequestManager } from './ApprovalRequestManager';
import { IHumanResponseHandler } from './contract/IEmployeeCommunication';
import { HumanAuthorizationStatus, HumanResponse } from './models/EmployeeCommunicationModels';

export class HumanResponseHandler implements IHumanResponseHandler {
  private approvalManager: ApprovalRequestManager;
  private responses: Map<string, HumanResponse> = new Map();

  constructor(approvalManager: ApprovalRequestManager) {
    this.approvalManager = approvalManager;
  }

  public processHumanResponse(
    approvalRequestId: string,
    userId: string,
    action: 'APPROVE' | 'REJECT' | 'COMMENT',
    comment?: string
  ): HumanResponse {
    const timestamp = new Date().toISOString();
    const responseId = `RSP-${approvalRequestId}-${Date.now()}`;

    // Identity Verification & Authorization Audit (Additional Requirement 2)
    const isHuman = userId.startsWith('HUMAN-') || userId.startsWith('ADMIN-') || userId.startsWith('CEO-');
    const authStatus: HumanAuthorizationStatus = isHuman ? 'AUTHORIZED' : 'UNAUTHORIZED';

    if (authStatus === 'UNAUTHORIZED') {
      throw new Error(
        `[Human Response Handler Block] Response from userId '${userId}' rejected. AI Agents cannot approve or resolve ApprovalRequests.`
      );
    }

    const response: HumanResponse = Object.freeze({
      responseId: responseId,
      approvalRequestId: approvalRequestId,
      action: action,
      userId: userId,
      authorizationStatus: authStatus,
      comment: comment,
      respondedAt: timestamp,
    });

    this.responses.set(responseId, response);

    // Update Approval Request status if APPROVE or REJECT
    if (action === 'APPROVE') {
      this.approvalManager.updateApprovalStatus(approvalRequestId, 'APPROVED');
    } else if (action === 'REJECT') {
      this.approvalManager.updateApprovalStatus(approvalRequestId, 'REJECTED');
    }

    return response;
  }
}
