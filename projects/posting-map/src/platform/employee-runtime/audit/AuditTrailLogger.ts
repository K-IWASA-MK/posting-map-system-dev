/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Immutable Audit Trail Logger
 */

import { IAuditTrailLogger } from '../contract/EmployeeGovernanceContract';
import { AuditLogEntry } from '../models/EmployeeDomainModels';

export class AuditTrailLogger implements IAuditTrailLogger {
  private logs: AuditLogEntry[] = [];

  public logEvent(entry: AuditLogEntry): void {
    // Immutable push
    this.logs.push(Object.freeze({ ...entry }));
  }

  public getLogs(taskId?: string): AuditLogEntry[] {
    if (taskId) {
      return this.logs.filter((l) => l.taskId === taskId);
    }
    return [...this.logs];
  }
}
