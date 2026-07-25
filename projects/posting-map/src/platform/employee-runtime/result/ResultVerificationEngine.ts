/**
 * AIOS Employee Result Foundation
 * Result Verification Engine Implementation
 */

import { IResultVerificationEngine } from './contract/IResultRegistry';
import { ResultRecord, ResultVerificationStatus } from './models/EmployeeResultModels';

export class ResultVerificationEngine implements IResultVerificationEngine {
  public verifyResult(
    result: ResultRecord,
    isPhysicalEvidenceVerified: boolean
  ): ResultVerificationStatus {
    // 1. Check for Terminal State (VERIFIED or REJECTED modification rejection)
    if (result.status === 'VERIFIED') {
      throw new Error(
        `[Result Verification Block] Result '${result.resultId}' is already 'VERIFIED'. Post-verification modification rejected.`
      );
    }
    if (result.status === 'REJECTED') {
      throw new Error(
        `[Result Verification Block] Cannot transition Result '${result.resultId}' from 'REJECTED' to 'VERIFIED'. REJECTED status is final.`
      );
    }

    // 2. Physical Evidence Verification Check
    if (!isPhysicalEvidenceVerified || result.executionResult.status !== 'SUCCESS') {
      return 'REJECTED';
    }

    return 'VERIFIED';
  }
}
