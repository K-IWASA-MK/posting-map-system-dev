/**
 * AIOS Employee Execution Runtime Foundation
 * Pre-Execution Validator for Task Contract Lock & Input Spec
 */

import { TaskRecord } from '../../task-assignment/models/TaskAssignmentModels';
import { IExecutionValidator } from './contract/IExecutor';

export class ExecutionValidator implements IExecutionValidator {
  public validateExecutionContract(
    task: TaskRecord,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): { valid: boolean; reason?: string } {
    // 1. Task Approval Check
    if (task.approvalStatus !== 'APPROVED') {
      return {
        valid: false,
        reason: `[Execution Validator Block] Task '${task.taskId}' is not approved (Status: '${task.approvalStatus}').`,
      };
    }

    // 2. Input Lock Specification Check
    const spec = task.inputSpec;
    if (spec.inputSource !== actualSource) {
      return {
        valid: false,
        reason: `[Execution Validator Block] Input source mismatch. Expected '${spec.inputSource}', got '${actualSource}'.`,
      };
    }

    if (spec.expectedRecordCount !== actualRecordCount) {
      return {
        valid: false,
        reason: `[Execution Validator Block] Record count mismatch. Expected ${spec.expectedRecordCount} records, got ${actualRecordCount} records. Execution Blocked.`,
      };
    }

    if (spec.checksum && spec.checksum !== actualChecksum) {
      return {
        valid: false,
        reason: `[Execution Validator Block] Checksum mismatch. Expected '${spec.checksum}', got '${actualChecksum}'.`,
      };
    }

    return { valid: true };
  }
}
