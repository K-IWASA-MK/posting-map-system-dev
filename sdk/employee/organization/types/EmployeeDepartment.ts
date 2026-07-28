/**
 * EmployeeDepartment.ts
 * 
 * Employee Department Model
 */

import { DepartmentId } from './DepartmentId';

export interface EmployeeDepartment {
  departmentId: DepartmentId | string;
  departmentName: string;
  supervisorId?: string;
  parentDepartmentId?: string;
  description?: string;
}
