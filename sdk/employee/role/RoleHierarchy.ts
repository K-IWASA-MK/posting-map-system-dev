/**
 * RoleHierarchy.ts
 * 
 * Role Hierarchy & Command Authority Evaluation
 */

import { EmployeeRole } from './types/EmployeeRole';
import { RoleLevel } from './types/RoleLevel';

export class RoleHierarchy {
  /**
   * Returns true if superiorRole can issue commands to targetRole
   */
  public static canCommand(superiorRole: EmployeeRole | string, targetRole: EmployeeRole | string): boolean {
    const superiorLevel = RoleLevel.getLevel(superiorRole);
    const targetLevel = RoleLevel.getLevel(targetRole);
    return superiorLevel > targetLevel;
  }

  /**
   * Returns true if roleA is higher rank than roleB
   */
  public static isHigherRank(roleA: EmployeeRole | string, roleB: EmployeeRole | string): boolean {
    return RoleLevel.getLevel(roleA) > RoleLevel.getLevel(roleB);
  }
}
