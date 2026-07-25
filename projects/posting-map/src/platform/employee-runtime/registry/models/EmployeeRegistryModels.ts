/**
 * AIOS Employee Registry Foundation
 * Domain Models for AI Employee Identification and Lifecycle Management
 */

import { AuthorityLevel } from '../../models/EmployeeDomainModels';

export type EmployeeLifecycleStatus = 'REGISTERED' | 'ACTIVE' | 'SUSPENDED' | 'RETIRED';

export interface EmployeeRecord {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly employeeType: string;
  readonly roleId: string;
  readonly authorityLevel: AuthorityLevel;
  readonly capabilities: ReadonlyArray<string>;
  status: EmployeeLifecycleStatus; // Mutable status
  readonly registeredAt: string;
}

export interface EmployeeFilter {
  employeeType?: string;
  roleId?: string;
  status?: EmployeeLifecycleStatus;
  capability?: string;
}

export interface EmployeeRegistryAuditEntry {
  readonly employeeId: string;
  readonly action: 'REGISTER' | 'UPDATE_STATUS';
  readonly before: EmployeeLifecycleStatus | null;
  readonly after: EmployeeLifecycleStatus;
  readonly timestamp: string;
}
