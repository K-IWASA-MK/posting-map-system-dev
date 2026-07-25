/**
 * AIOS Employee Registry Foundation
 * Employee Registry Engine Implementation
 */

import { IEmployeeRegistry } from './contract/IEmployeeRegistry';
import {
  EmployeeFilter,
  EmployeeLifecycleStatus,
  EmployeeRecord,
  EmployeeRegistryAuditEntry,
} from './models/EmployeeRegistryModels';

export class EmployeeRegistryEngine implements IEmployeeRegistry {
  private records: Map<string, EmployeeRecord> = new Map();
  private auditLogs: EmployeeRegistryAuditEntry[] = [];

  public register(record: EmployeeRecord): void {
    // 1. Check for Duplicate EmployeeId
    if (this.records.has(record.employeeId)) {
      throw new Error(`[Registry Block] EmployeeId '${record.employeeId}' already exists.`);
    }

    // 2. Freeze immutable structure
    const frozenRecord: EmployeeRecord = {
      ...record,
      capabilities: Object.freeze([...record.capabilities]),
    };

    this.records.set(record.employeeId, frozenRecord);

    // 3. Log Audit Trail
    this.auditLogs.push(
      Object.freeze({
        employeeId: record.employeeId,
        action: 'REGISTER',
        before: null,
        after: record.status,
        timestamp: new Date().toISOString(),
      })
    );
  }

  public find(employeeId: string): EmployeeRecord | null {
    return this.records.get(employeeId) || null;
  }

  public get(employeeId: string): EmployeeRecord {
    const record = this.find(employeeId);
    if (!record) {
      throw new Error(`[Registry Block] EmployeeId '${employeeId}' not found.`);
    }
    return record;
  }

  public list(filter?: EmployeeFilter): EmployeeRecord[] {
    let result = Array.from(this.records.values());

    if (!filter) return result;

    if (filter.employeeType) {
      result = result.filter((r) => r.employeeType === filter.employeeType);
    }
    if (filter.roleId) {
      result = result.filter((r) => r.roleId === filter.roleId);
    }
    if (filter.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    if (filter.capability) {
      result = result.filter((r) => r.capabilities.includes(filter.capability!));
    }

    return result;
  }

  public updateStatus(
    employeeId: string,
    newStatus: EmployeeLifecycleStatus
  ): EmployeeRecord {
    const record = this.get(employeeId);
    const currentStatus = record.status;

    // Fixed Lifecycle State Transition Rules
    // Prohibition: RETIRED -> ACTIVE/REGISTERED/SUSPENDED (Restoration from RETIRED is forbidden)
    if (currentStatus === 'RETIRED') {
      throw new Error(
        `[Lifecycle Block] Cannot transition Employee '${employeeId}' from 'RETIRED' to '${newStatus}'. RETIRED state is final.`
      );
    }

    const validTransitions: Record<EmployeeLifecycleStatus, EmployeeLifecycleStatus[]> = {
      REGISTERED: ['ACTIVE', 'RETIRED'],
      ACTIVE: ['SUSPENDED', 'RETIRED'],
      SUSPENDED: ['ACTIVE', 'RETIRED'],
      RETIRED: [],
    };

    const allowed = validTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `[Lifecycle Block] Invalid status transition from '${currentStatus}' to '${newStatus}' for Employee '${employeeId}'.`
      );
    }

    // Apply Status Change
    record.status = newStatus;

    // Record Audit Event
    this.auditLogs.push(
      Object.freeze({
        employeeId: employeeId,
        action: 'UPDATE_STATUS',
        before: currentStatus,
        after: newStatus,
        timestamp: new Date().toISOString(),
      })
    );

    return record;
  }

  public getAuditLogs(employeeId?: string): EmployeeRegistryAuditEntry[] {
    if (employeeId) {
      return this.auditLogs.filter((log) => log.employeeId === employeeId);
    }
    return [...this.auditLogs];
  }
}
