/**
 * AIOS Task Assignment Foundation
 * Validator for Task Approval, Scope, Input Lock, and Tool Permissions
 */

import { ITaskAssignmentValidator } from './contract/ITaskAssignment';
import { TaskRecord } from './models/TaskAssignmentModels';

export class TaskAssignmentValidator implements ITaskAssignmentValidator {
  public validateApproval(task: TaskRecord): { valid: boolean; reason?: string } {
    if (task.approvalStatus !== 'APPROVED') {
      return {
        valid: false,
        reason: `[Task Approval Block] Task '${task.taskId}' is not approved. Current status is '${task.approvalStatus}'. Execution Blocked.`,
      };
    }
    return { valid: true };
  }

  public validateAction(
    task: TaskRecord,
    action: string
  ): { valid: boolean; reason?: string } {
    if (task.scope.forbiddenActions.includes(action)) {
      return {
        valid: false,
        reason: `[Task Scope Block] Action '${action}' is explicitly forbidden in Task '${task.taskId}'.`,
      };
    }

    if (!task.scope.allowedActions.includes(action)) {
      return {
        valid: false,
        reason: `[Task Scope Block] Action '${action}' is not in allowedActions for Task '${task.taskId}'. Must transition to WAITING_APPROVAL.`,
      };
    }

    return { valid: true };
  }

  public validateInput(
    task: TaskRecord,
    actualSource: string,
    actualRecordCount: number,
    actualChecksum: string
  ): { valid: boolean; reason?: string } {
    const spec = task.inputSpec;

    if (spec.inputSource !== actualSource) {
      return {
        valid: false,
        reason: `[Task Input Block] Input source mismatch. Expected '${spec.inputSource}', got '${actualSource}'.`,
      };
    }

    if (spec.expectedRecordCount !== actualRecordCount) {
      return {
        valid: false,
        reason: `[Task Input Block] Record count mismatch. Expected ${spec.expectedRecordCount} records, got ${actualRecordCount} records. Execution Blocked.`,
      };
    }

    if (spec.checksum && spec.checksum !== actualChecksum) {
      return {
        valid: false,
        reason: `[Task Input Block] Checksum mismatch. Expected '${spec.checksum}', got '${actualChecksum}'.`,
      };
    }

    return { valid: true };
  }

  public validateTool(
    task: TaskRecord,
    toolName: string
  ): { valid: boolean; reason?: string } {
    if (!task.allowedTools.includes(toolName)) {
      return {
        valid: false,
        reason: `[Task Tool Block] Tool '${toolName}' is not in allowedTools whitelist for Task '${task.taskId}'.`,
      };
    }

    return { valid: true };
  }
}
