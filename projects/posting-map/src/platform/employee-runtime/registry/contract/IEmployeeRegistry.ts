/**
 * AIOS Employee Registry Foundation
 * Contract Interface for Employee Registry Operations
 */

import {
  EmployeeFilter,
  EmployeeLifecycleStatus,
  EmployeeRecord,
  EmployeeRegistryAuditEntry,
} from '../models/EmployeeRegistryModels';

export interface IEmployeeRegistry {
  register(record: EmployeeRecord): void;
  find(employeeId: string): EmployeeRecord | null;
  get(employeeId: string): EmployeeRecord;
  list(filter?: EmployeeFilter): EmployeeRecord[];
  updateStatus(employeeId: string, newStatus: EmployeeLifecycleStatus): EmployeeRecord;
  getAuditLogs(employeeId?: string): EmployeeRegistryAuditEntry[];
}
