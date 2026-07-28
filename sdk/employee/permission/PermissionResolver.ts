/**
 * PermissionResolver.ts
 * 
 * 3-Tier Permission Evaluation Chain Resolver:
 * Tier 1: Role Policy
 * Tier 2: Department Policy
 * Tier 3: Individual Employee Overrides
 */

import { DepartmentPermissionPolicy, RolePermissionPolicy } from './PermissionPolicy';
import { EmployeePermission } from './types/EmployeePermission';

export interface PermissionContext {
  role: string;
  departmentId: string;
  individualOverrides?: EmployeePermission[];
}

export class PermissionResolver {
  /**
   * Resolves the combined effective permissions for an employee context
   */
  public static resolveEffectivePermissions(context: PermissionContext): Set<EmployeePermission> {
    const permissions = new Set<EmployeePermission>();

    // Tier 1: Role Policy Permissions
    const rolePermissions = RolePermissionPolicy.getPermissionsForRole(context.role);
    rolePermissions.forEach((p) => permissions.add(p));

    // Tier 2: Department Policy Permissions
    const deptPermissions = DepartmentPermissionPolicy.getPermissionsForDepartment(context.departmentId);
    deptPermissions.forEach((p) => permissions.add(p));

    // Tier 3: Individual Overrides
    if (context.individualOverrides) {
      context.individualOverrides.forEach((p) => permissions.add(p));
    }

    return permissions;
  }

  /**
   * Checks if the given context grants a target permission
   */
  public static hasPermission(context: PermissionContext, targetPermission: EmployeePermission | string): boolean {
    const effective = this.resolveEffectivePermissions(context);
    return effective.has(targetPermission as EmployeePermission);
  }
}
