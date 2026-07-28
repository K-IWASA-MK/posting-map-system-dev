/**
 * CapabilityAssignment.ts
 * 
 * Association between Employee and EmployeeCapabilities
 */

import { EmployeeCapability } from './EmployeeCapability';

export interface CapabilityAssignment {
  employeeId: string;
  capabilities: EmployeeCapability[];
  assignedAt: string;
}
