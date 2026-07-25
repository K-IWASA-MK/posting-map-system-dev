/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Completion Verification Engine
 */

import { ICompletionVerificationEngine } from '../contract/EmployeeGovernanceContract';
import { VerificationReport } from '../models/EmployeeDomainModels';

export class CompletionVerificationEngine implements ICompletionVerificationEngine {
  public verifyCompletion(
    report: VerificationReport
  ): { canComplete: boolean; reason?: string } {
    // 1. Prohibit direct completion from SIMULATED state
    if (report.completionLevel === 'SIMULATED') {
      return {
        canComplete: false,
        reason: `[Completion Verification Block] Cannot transition directly to COMPLETED from 'SIMULATED' status. Real environment verification required.`,
      };
    }

    // 2. Require physical verification flag
    if (!report.isVerified) {
      return {
        canComplete: false,
        reason: `[Completion Verification Block] Execution output is not physically verified (isVerified=false).`,
      };
    }

    // 3. Require physical record count > 0
    if (report.physicalRecordCount <= 0) {
      return {
        canComplete: false,
        reason: `[Completion Verification Block] Physical record count is 0. Output artifacts missing.`,
      };
    }

    return { canComplete: true };
  }
}
