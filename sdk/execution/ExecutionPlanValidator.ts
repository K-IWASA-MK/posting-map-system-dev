/**
 * ExecutionPlanValidator.ts
 * 
 * Execution Plan & Step モデルバリデータ
 * 
 * 計画の完全性、順序（order: 1, 2, 3...）、IDのユニーク性、ステータス列挙値を検証する。
 */

import { ExecutionPermissionScope } from './ExecutionPermissionGate';
import {
  ExecutionPlan,
  ExecutionPlanStatus,
  ExecutionStepStatus
} from './ExecutionPlanModel';

export class ExecutionPlanValidator {
  /**
   * ExecutionPlan オブジェクトが正当かを検証する
   */
  static validatePlan(plan: unknown): plan is ExecutionPlan {
    if (!plan || typeof plan !== 'object') {
      return false;
    }

    const p = plan as Record<string, any>;

    if (typeof p.planId !== 'string' || p.planId.trim() === '') {
      return false;
    }

    if (typeof p.taskId !== 'string' || p.taskId.trim() === '') {
      return false;
    }

    if (typeof p.employeeId !== 'string' || p.employeeId.trim() === '') {
      return false;
    }

    if (!Object.values(ExecutionPlanStatus).includes(p.status)) {
      return false;
    }

    if (!Array.isArray(p.steps) || p.steps.length === 0) {
      return false;
    }

    const stepIds = new Set<string>();
    const validStepStatuses = Object.values(ExecutionStepStatus);
    const validScopes = Object.values(ExecutionPermissionScope);

    for (let i = 0; i < p.steps.length; i++) {
      const step = p.steps[i];
      if (!step || typeof step !== 'object') {
        return false;
      }

      if (typeof step.stepId !== 'string' || step.stepId.trim() === '') {
        return false;
      }

      if (stepIds.has(step.stepId)) {
        return false; // Duplicate stepId
      }
      stepIds.add(step.stepId);

      if (typeof step.order !== 'number' || step.order !== i + 1) {
        return false; // Orders must be 1-indexed sequential (1, 2, 3...)
      }

      if (typeof step.title !== 'string' || step.title.trim() === '') {
        return false;
      }

      if (typeof step.actionType !== 'string' || step.actionType.trim() === '') {
        return false;
      }

      if (!validStepStatuses.includes(step.status)) {
        return false;
      }

      if (step.requiredPermissionScope !== undefined && !validScopes.includes(step.requiredPermissionScope)) {
        return false;
      }
    }

    if (typeof p.createdAt !== 'string' || Number.isNaN(Date.parse(p.createdAt))) {
      return false;
    }

    if (typeof p.updatedAt !== 'string' || Number.isNaN(Date.parse(p.updatedAt))) {
      return false;
    }

    return true;
  }
}
