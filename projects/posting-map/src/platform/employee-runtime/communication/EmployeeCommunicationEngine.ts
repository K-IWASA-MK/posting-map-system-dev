/**
 * AIOS Employee Communication Foundation
 * Integrated Communication Engine Implementation
 */

import { ApprovalRequestManager } from './ApprovalRequestManager';
import { HumanResponseHandler } from './HumanResponseHandler';
import { NotificationGateway } from './NotificationGateway';
import { IEmployeeCommunicationEngine } from './contract/IEmployeeCommunication';
import {
  ApprovalRequest,
  CommunicationAuditRecord,
  HumanResponse,
  NotificationRecord,
} from './models/EmployeeCommunicationModels';

export class EmployeeCommunicationEngine implements IEmployeeCommunicationEngine {
  private gateway = new NotificationGateway();
  private approvalManager = new ApprovalRequestManager();
  private responseHandler = new HumanResponseHandler(this.approvalManager);
  private auditLogs: CommunicationAuditRecord[] = [];

  public sendNotification(
    sourceComponent: string,
    eventType: string,
    message: string
  ): NotificationRecord {
    const notification = this.gateway.createNotification(sourceComponent, eventType, message);

    this.recordAudit(
      notification.notificationId,
      eventType,
      'ADMINISTRATOR',
      'NOTIFICATION',
      undefined,
      `Notification [${notification.priority}] sent with Hash [${notification.notificationHash}]`
    );

    return notification;
  }

  public requestApproval(
    taskId: string,
    employeeId: string,
    reason: string,
    workflowId?: string
  ): ApprovalRequest {
    const request = this.approvalManager.createApprovalRequest(taskId, employeeId, reason, workflowId);

    this.recordAudit(
      request.approvalRequestId,
      'APPROVAL_REQUESTED',
      'ADMINISTRATOR',
      'APPROVAL_REQUEST',
      undefined,
      `Approval requested for Task '${taskId}' assigned to '${employeeId}'`
    );

    return request;
  }

  public handleHumanResponse(
    approvalRequestId: string,
    userId: string,
    action: 'APPROVE' | 'REJECT' | 'COMMENT',
    comment?: string
  ): HumanResponse {
    const response = this.responseHandler.processHumanResponse(
      approvalRequestId,
      userId,
      action,
      comment
    );

    this.recordAudit(
      response.responseId,
      `HUMAN_RESPONSE_${action}`,
      userId,
      'HUMAN_RESPONSE',
      `Result: ${action} (Status: ${response.authorizationStatus})`,
      comment || 'Human response processed successfully.'
    );

    return response;
  }

  public getAuditLogs(communicationId?: string): CommunicationAuditRecord[] {
    if (communicationId) {
      return this.auditLogs.filter((log) => log.communicationId === communicationId);
    }
    return [...this.auditLogs];
  }

  private recordAudit(
    communicationId: string,
    eventType: string,
    recipient: string,
    messageType: string,
    response?: string,
    reason?: string
  ) {
    this.auditLogs.push(
      Object.freeze({
        auditId: `AUD-COM-${Date.now()}`,
        communicationId: communicationId,
        eventType: eventType,
        recipient: recipient,
        messageType: messageType,
        response: response || reason,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
