/**
 * EmployeeProfile.ts
 * 
 * Immutable AI Employee Profile
 */

import { AIEmployeeIdentity } from '../../manager/types/AIEmployeeIdentity';
import { EmployeeRole } from '../../role/types/EmployeeRole';
import { DepartmentId } from '../../organization/types/DepartmentId';
import { EmployeeCapability } from '../../capability/types/EmployeeCapability';
import { EmployeePermission } from '../../permission/types/EmployeePermission';

import { ProfessionAssignment } from '../../profession/assignment/types/ProfessionAssignment';

export interface EmployeeProfile {
  identity: AIEmployeeIdentity;
  role: EmployeeRole | string;
  departmentId: DepartmentId | string;
  capabilities: EmployeeCapability[];
  permissions: EmployeePermission[];
  professionAssignment?: ProfessionAssignment;
}
