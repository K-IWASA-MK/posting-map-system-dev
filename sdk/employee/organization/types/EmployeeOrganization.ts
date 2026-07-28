/**
 * EmployeeOrganization.ts
 * 
 * Enterprise AI Employee Organization Model
 */

import { OrganizationId } from './OrganizationId';
import { EmployeeDepartment } from './EmployeeDepartment';

export interface EmployeeOrganization {
  organizationId: OrganizationId;
  companyName: string;
  departments: EmployeeDepartment[];
  createdAt: string;
}
