/**
 * AIOS Employee Communication Foundation
 * Domain Models for Notifications, Approval Requests, Human Responses, and Audit Logs
 */

export type CommunicationPriority = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type ApprovalRequestStatus = 'REQUESTED' | 'WAITING' | 'APPROVED' | 'REJECTED';

export type HumanAuthorizationStatus = 'AUTHORIZED' | 'UNAUTHORIZED';

export interface NotificationRecord {
  readonly notificationId: string;
  readonly sourceComponent: string;
  readonly eventType: string;
  readonly priority: CommunicationPriority;
  readonly message: string;
  readonly notificationHash: string; // Additional Requirement 1: Tamper-detection hash
  readonly timestamp: string;
}

export interface ApprovalRequest {
  readonly approvalRequestId: string;
  readonly taskId: string;
  readonly workflowId?: string;
  readonly employeeId: string;
  readonly reason: string;
  readonly status: ApprovalRequestStatus;
  readonly requestedAt: string;
}

export interface HumanResponse {
  readonly responseId: string;
  readonly approvalRequestId: string;
  readonly action: 'APPROVE' | 'REJECT' | 'COMMENT';
  readonly userId: string;
  readonly authorizationStatus: HumanAuthorizationStatus; // Additional Requirement 2: Identity audit
  readonly comment?: string;
  readonly respondedAt: string;
}

export interface CommunicationAuditRecord {
  readonly auditId: string;
  readonly communicationId: string;
  readonly eventType: string;
  readonly recipient: string;
  readonly messageType: string;
  readonly response?: string;
  readonly timestamp: string;
}
