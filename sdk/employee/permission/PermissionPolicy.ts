/**
 * PermissionPolicy.ts
 * 
 * Default Role & Department Permission Policies
 */

import { EmployeeRole } from '../role/types/EmployeeRole';
import { DepartmentId } from '../organization/types/DepartmentId';
import { EmployeePermission } from './types/EmployeePermission';

export class RolePermissionPolicy {
  private static readonly roleMap: Record<string, EmployeePermission[]> = {
    [EmployeeRole.SUPERVISOR]: [
      EmployeePermission.CAN_CREATE_TASK,
      EmployeePermission.CAN_ASSIGN,
      EmployeePermission.CAN_DEPROVISION,
      EmployeePermission.CAN_REGISTER_HANDLER,
      EmployeePermission.CAN_DEPLOY,
      EmployeePermission.CAN_APPROVE,
      EmployeePermission.CAN_EXECUTE,
      EmployeePermission.CAN_VIEW
    ],
    [EmployeeRole.MANAGER]: [
      EmployeePermission.CAN_CREATE_TASK,
      EmployeePermission.CAN_ASSIGN,
      EmployeePermission.CAN_APPROVE,
      EmployeePermission.CAN_EXECUTE,
      EmployeePermission.CAN_VIEW
    ],
    [EmployeeRole.SENIOR_WORKER]: [
      EmployeePermission.CAN_CREATE_TASK,
      EmployeePermission.CAN_EXECUTE,
      EmployeePermission.CAN_VIEW
    ],
    [EmployeeRole.WORKER]: [
      EmployeePermission.CAN_EXECUTE,
      EmployeePermission.CAN_VIEW
    ],
    [EmployeeRole.OBSERVER]: [
      EmployeePermission.CAN_VIEW
    ]
  };

  public static getPermissionsForRole(role: string): EmployeePermission[] {
    return this.roleMap[role] || [EmployeePermission.CAN_VIEW];
  }
}

export class DepartmentPermissionPolicy {
  private static readonly deptMap: Record<string, EmployeePermission[]> = {
    [DepartmentId.EXECUTIVE]: [EmployeePermission.CAN_APPROVE, EmployeePermission.CAN_DEPROVISION],
    [DepartmentId.DEPLOYMENT]: [EmployeePermission.CAN_DEPLOY],
    [DepartmentId.DEVELOPMENT]: [EmployeePermission.CAN_REGISTER_HANDLER]
  };

  public static getPermissionsForDepartment(deptId: string): EmployeePermission[] {
    return this.deptMap[deptId] || [];
  }
}
