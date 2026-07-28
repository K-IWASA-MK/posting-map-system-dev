/**
 * CapabilityResolver.ts
 * 
 * Capability Resolution & Match Score Calculator
 */

import { EmployeeCapability } from './types/EmployeeCapability';

export class CapabilityResolver {
  /**
   * Checks if an employee's capabilities satisfy all required capability IDs
   */
  public static hasAllCapabilities(
    employeeCapabilities: EmployeeCapability[],
    requiredCapabilities: string[]
  ): boolean {
    if (!requiredCapabilities || requiredCapabilities.length === 0) {
      return true;
    }
    return requiredCapabilities.every((req) =>
      employeeCapabilities.some((cap) => cap.matches(req))
    );
  }

  /**
   * Calculates a match score between 0.0 and 1.0
   */
  public static calculateMatchScore(
    employeeCapabilities: EmployeeCapability[],
    requiredCapabilities: string[]
  ): number {
    if (!requiredCapabilities || requiredCapabilities.length === 0) {
      return 1.0;
    }
    const matchedCount = requiredCapabilities.filter((req) =>
      employeeCapabilities.some((cap) => cap.matches(req))
    ).length;

    return matchedCount / requiredCapabilities.length;
  }
}
