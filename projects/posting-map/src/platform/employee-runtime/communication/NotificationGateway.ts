/**
 * AIOS Employee Communication Foundation
 * Notification Gateway Implementation (Deterministic Priority & Tamper Hash)
 */

import { INotificationGateway } from './contract/IEmployeeCommunication';
import { CommunicationPriority, NotificationRecord } from './models/EmployeeCommunicationModels';

export class NotificationGateway implements INotificationGateway {
  private notifications: NotificationRecord[] = [];

  public createNotification(
    sourceComponent: string,
    eventType: string,
    message: string
  ): NotificationRecord {
    const timestamp = new Date().toISOString();
    const notificationId = `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const priority = this.determinePriority(sourceComponent, eventType);

    // Simple deterministic Tamper-detection Hash (Additional Requirement 1)
    const rawData = `${sourceComponent}:${eventType}:${message}:${timestamp}`;
    const notificationHash = this.computeHash(rawData);

    const record: NotificationRecord = Object.freeze({
      notificationId: notificationId,
      sourceComponent: sourceComponent,
      eventType: eventType,
      priority: priority,
      message: message,
      notificationHash: notificationHash,
      timestamp: timestamp,
    });

    this.notifications.push(record);
    return record;
  }

  public getNotifications(): NotificationRecord[] {
    return [...this.notifications];
  }

  private determinePriority(sourceComponent: string, eventType: string): CommunicationPriority {
    const upper = (sourceComponent + ':' + eventType).toUpperCase();

    if (upper.includes('POLICY_VIOLATION') || upper.includes('ENFORCEMENT_BLOCKED') || upper.includes('CRITICAL')) {
      return 'CRITICAL';
    }

    if (upper.includes('FAILURE') || upper.includes('FAILED') || upper.includes('PAUSED')) {
      return 'HIGH';
    }

    if (upper.includes('WARNING') || upper.includes('REJECTED')) {
      return 'WARNING';
    }

    return 'INFO';
  }

  private computeHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `HASH-${Math.abs(hash).toString(16)}`;
  }
}
