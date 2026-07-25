/**
 * AIOS Employee Communication Foundation
 * Abstraction Interfaces for Notification Gateway, Approval Request Manager, Human Response Handler, and Communication Engine
 */

import {
  ApprovalRequest,
  CommunicationAuditRecord,
  HumanResponse,
  NotificationRecord,
} from '../models/EmployeeCommunicationModels';

export interface INotificationGateway {
  createNotification(
    sourceComponent: string,
    eventType: string,
    message: string
  ): NotificationRecord;
  getNotifications(): NotificationRecord[];
}

export interface IApprovalRequestManager {
  createApprovalRequest(
    taskId: string,
    employeeId: string,
    reason: string,
    workflowId?: string
  ): ApprovalRequest;
  updateApprovalStatus(
    approvalRequestId: string,
    newStatus: 'APPROVED' | 'REJECTED'
  ): ApprovalRequest;
  getApprovalRequest(approvalRequestId: string): ApprovalRequest;
}

export interface IHumanResponseHandler {
  processHumanResponse(
    approvalRequestId: string,
    userId: string,
    action: 'APPROVE' | 'REJECT' | 'COMMENT',
    comment?: string
  ): HumanResponse;
}

export interface IEmployeeCommunicationEngine {
  sendNotification(sourceComponent: string, eventType: string, message: string): NotificationRecord;
  requestApproval(taskId: string, employeeId: string, reason: string, workflowId?: string): ApprovalRequest;
  handleHumanResponse(approvalRequestId: string, userId: string, action: 'APPROVE' | 'REJECT' | 'COMMENT', comment?: string): HumanResponse;
  getAuditLogs(communicationId?: string): CommunicationAuditRecord[];
}
