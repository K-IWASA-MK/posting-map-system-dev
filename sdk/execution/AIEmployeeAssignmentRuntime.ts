/**
 * AIEmployeeAssignmentRuntime.ts
 * 
 * AI 社員アサインメント・ランタイム
 * 
 * タスクの必要能力要件（requiredCapabilities）と AI 社員の利用可能能力（VerificationCapability）
 * および実行権限スコープ（ExecutionPermissionGate）を多角的に適合評価（Matching Engine）し、
 * 条件を満たす場合のみ安全にタスクを割り当てる。
 */

import {
  VerificationCapability,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../verification/VerificationCapabilityModel';
import { ExecutionTask } from './ExecutionTaskModel';
import { ExecutionTaskRegistry } from './ExecutionTaskRegistry';
import { ExecutionPermissionGate, ExecutionPermissionScope } from './ExecutionPermissionGate';

export interface AssignmentEvaluationResult {
  readonly assignable: boolean;
  readonly matchScore: number; // 0 - 100
  readonly missingCapabilities: readonly VerificationCapabilityType[];
  readonly permissionDeniedReasons: readonly string[];
  readonly reason: string;
}

export class AIEmployeeAssignmentRuntime {
  /**
   * 能力要件種別に対応する標準推奨権限スコープのマッピング表
   */
  private static readonly capabilityPermissionMap: Partial<Record<VerificationCapabilityType, ExecutionPermissionScope>> = {
    [VerificationCapabilityType.GIT_ACCESS]: ExecutionPermissionScope.GIT_COMMIT,
    [VerificationCapabilityType.BROWSER_AUTOMATION]: ExecutionPermissionScope.BROWSER_ACTION,
    [VerificationCapabilityType.DEPLOYMENT_STATUS]: ExecutionPermissionScope.DEPLOY_PRODUCTION
  };

  /**
   * タスクと AI 社員の適合度および割当可能性を評価する (Capability & Permission Matching Engine)
   */
  static evaluateAssignment(
    task: ExecutionTask,
    employeeId: string,
    employeeCapabilities: readonly VerificationCapability[]
  ): AssignmentEvaluationResult {
    if (!task) {
      throw new Error('[AIEmployeeAssignmentRuntime] task is required');
    }
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('[AIEmployeeAssignmentRuntime] employeeId is required');
    }

    const availableCapSet = new Set<VerificationCapabilityType>();
    if (Array.isArray(employeeCapabilities)) {
      for (const cap of employeeCapabilities) {
        if (cap && cap.status === VerificationCapabilityStatus.AVAILABLE) {
          availableCapSet.add(cap.type);
        }
      }
    }

    const missingCapabilities: VerificationCapabilityType[] = [];
    const permissionDeniedReasons: string[] = [];

    // 1. Check Capabilities
    for (const reqCap of task.requiredCapabilities) {
      if (!availableCapSet.has(reqCap)) {
        missingCapabilities.push(reqCap);
      }

      // Check corresponding permission gate scope if mapped
      const requiredScope = this.capabilityPermissionMap[reqCap];
      if (requiredScope) {
        const permCheck = ExecutionPermissionGate.checkPermission(employeeId, requiredScope);
        if (!permCheck.allowed) {
          permissionDeniedReasons.push(permCheck.reason || `Denied scope: ${requiredScope}`);
        }
      }
    }

    const totalRequired = task.requiredCapabilities.length;
    const matchedCount = totalRequired - missingCapabilities.length;
    const matchScore = totalRequired === 0 ? 100 : Math.round((matchedCount / totalRequired) * 100);

    const assignable = missingCapabilities.length === 0 && permissionDeniedReasons.length === 0;

    let reason = 'Assignment Evaluation PASSED. All required capabilities and permissions match.';
    if (!assignable) {
      const parts: string[] = [];
      if (missingCapabilities.length > 0) {
        parts.push(`Missing Capabilities: [${missingCapabilities.join(', ')}]`);
      }
      if (permissionDeniedReasons.length > 0) {
        parts.push(`Permission Denied: [${permissionDeniedReasons.join('; ')}]`);
      }
      reason = `Assignment REJECTED. ${parts.join(' | ')}`;
    }

    return Object.freeze({
      assignable,
      matchScore,
      missingCapabilities: Object.freeze(missingCapabilities),
      permissionDeniedReasons: Object.freeze(permissionDeniedReasons),
      reason
    });
  }

  /**
   * 適合評価（evaluateAssignment）を実施し、成功した場合のみ ExecutionTaskRegistry を介してアサインを行う
   */
  static assignTask(
    taskId: string,
    employeeId: string,
    employeeCapabilities: readonly VerificationCapability[]
  ): ExecutionTask {
    const task = ExecutionTaskRegistry.get(taskId);
    if (!task) {
      throw new Error(`[AIEmployeeAssignmentRuntime] Task not found in registry: ${taskId}`);
    }

    const evaluation = this.evaluateAssignment(task, employeeId, employeeCapabilities);
    if (!evaluation.assignable) {
      throw new Error(`[AIEmployeeAssignmentRuntime] Task assignment failed for ${taskId} -> ${employeeId}: ${evaluation.reason}`);
    }

    return ExecutionTaskRegistry.assignEmployee(taskId, employeeId);
  }
}
