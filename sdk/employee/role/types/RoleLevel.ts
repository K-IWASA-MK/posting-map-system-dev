/**
 * RoleLevel.ts
 * 
 * Numerical level mapping for Employee Roles
 */

import { EmployeeRole } from './EmployeeRole';

export const RoleLevelMap: Record<EmployeeRole, number> = {
  [EmployeeRole.SUPERVISOR]: 50,
  [EmployeeRole.MANAGER]: 40,
  [EmployeeRole.SENIOR_WORKER]: 30,
  [EmployeeRole.WORKER]: 20,
  [EmployeeRole.OBSERVER]: 10
};

export class RoleLevel {
  public static getLevel(role: EmployeeRole | string): number {
    return RoleLevelMap[role as EmployeeRole] || 0;
  }
}
