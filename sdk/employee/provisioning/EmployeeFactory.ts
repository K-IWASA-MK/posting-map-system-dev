/**
 * EmployeeFactory.ts
 * 
 * Factory for creating EmployeeProfile & initial EmployeeStatus
 */

import { AIEmployeeIdentity } from '../manager/types/AIEmployeeIdentity';
import { EmployeeRole } from '../role/types/EmployeeRole';
import { DepartmentId } from '../organization/types/DepartmentId';
import { EmployeeCapability } from '../capability/types/EmployeeCapability';
import { EmployeePermission } from '../permission/types/EmployeePermission';
import { PermissionResolver } from '../permission/PermissionResolver';
import { EmployeeProfile } from './types/EmployeeProfile';
import { EmployeeStatus } from './types/EmployeeStatus';
import { EmployeeState } from './types/EmployeeState';

export class EmployeeFactory {
  public static createProfile(
    employeeId: string,
    employeeName: string,
    role: EmployeeRole | string,
    departmentId: DepartmentId | string,
    capabilities: EmployeeCapability[] = [],
    individualPermissions?: EmployeePermission[]
  ): EmployeeProfile {
    const identity: AIEmployeeIdentity = {
      employeeId,
      employeeName,
      employeeType: role === EmployeeRole.SUPERVISOR ? 'SUPERVISOR' : 'AGENT',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    };

    const effectivePermSet = PermissionResolver.resolveEffectivePermissions({
      role,
      departmentId,
      individualOverrides: individualPermissions
    });

    return {
      identity,
      role,
      departmentId,
      capabilities,
      permissions: Array.from(effectivePermSet)
    };
  }

  public static createInitialStatus(employeeId: string): EmployeeStatus {
    return {
      employeeId,
      state: EmployeeState.IDLE,
      lastHeartbeat: new Date().toISOString(),
      load: 0.0
    };
  }
}
