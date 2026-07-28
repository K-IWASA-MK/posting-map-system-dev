/**
 * ResponsibilityResolver.ts
 * 
 * Responsibility Coverage Evaluation Resolver
 */

import { ProcessResponsibility, ResponsibilityMatrix } from './ResponsibilityMatrix';
import { ResponsibilityType } from './types/ResponsibilityType';

export class ResponsibilityResolver {
  public static coversProcess(
    matrix: ResponsibilityMatrix,
    processName: string,
    minType: ResponsibilityType = ResponsibilityType.RESPONSIBLE
  ): boolean {
    if (!matrix || !matrix.responsibilities) return false;
    const target = processName.trim().toUpperCase();

    return matrix.responsibilities.some((r) => {
      const pName = r.processName.trim().toUpperCase();
      if (pName !== target) return false;
      if (minType === ResponsibilityType.RESPONSIBLE) {
        return r.responsibilityType === ResponsibilityType.RESPONSIBLE || r.responsibilityType === ResponsibilityType.ACCOUNTABLE;
      }
      return true;
    });
  }
}
