/**
 * AIOS Basic AI Employee Governance Foundation (v1)
 * Input Lock Guard
 */

import { IInputLockGuard } from '../contract/EmployeeGovernanceContract';
import { InputLockSpec } from '../models/EmployeeDomainModels';

export class InputLockGuard implements IInputLockGuard {
  public validateInput(
    spec: InputLockSpec,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): { valid: boolean; reason?: string } {
    // 1. Check Input Source Path / File ID Match
    if (spec.inputSource !== actualSource) {
      return {
        valid: false,
        reason: `[Input Lock Block] Input source mismatch. Expected '${spec.inputSource}', got '${actualSource}'.`,
      };
    }

    // 2. Check Expected Record Count Match
    if (spec.expectedRecordCount !== actualRecordCount) {
      return {
        valid: false,
        reason: `[Input Lock Block] Record count mismatch. Expected ${spec.expectedRecordCount} records, got ${actualRecordCount} records. Execution Blocked.`,
      };
    }

    // 3. Check Checksum Match (if checksum provided)
    if (spec.checksum && spec.checksum !== actualChecksum) {
      return {
        valid: false,
        reason: `[Input Lock Block] Checksum mismatch. Expected '${spec.checksum}', got '${actualChecksum}'.`,
      };
    }

    return { valid: true };
  }
}
