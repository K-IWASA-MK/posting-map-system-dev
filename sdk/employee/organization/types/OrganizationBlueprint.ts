/**
 * OrganizationBlueprint.ts
 * 
 * Blueprint model for provisioning AI Employee Organizations dynamically.
 */

import { DepartmentId } from './DepartmentId';

export interface WorkerSpec {
  role: string;
  employeeName: string;
  departmentId: DepartmentId | string;
  capabilities: string[];
  permissions?: string[];
  count?: number;
}

export interface OrganizationBlueprint {
  blueprintId: string;
  companyName: string;
  supervisorSpec: {
    employeeId: string;
    employeeName: string;
    departmentId: DepartmentId | string;
    capabilities: string[];
    permissions?: string[];
  };
  workerSpecs: WorkerSpec[];
}
