/**
 * ExecutionPlanFactory.ts
 * 
 * Execution Plan & Step 不変ファクトリ
 * 
 * AIOS 規格に従った Plan ID（PLAN-YYYYMMDD-XXXXXX）および不変ステップ配列（Object.freeze）を生成する。
 */

import { ExecutionPermissionScope } from './ExecutionPermissionGate';
import {
  ExecutionPlan,
  ExecutionPlanStatus,
  ExecutionStep,
  ExecutionStepResult,
  ExecutionStepStatus
} from './ExecutionPlanModel';
import { ExecutionPlanValidator } from './ExecutionPlanValidator';

export interface CreateStepParams {
  stepId?: string;
  order?: number;
  title: string;
  actionType: string;
  requiredPermissionScope?: ExecutionPermissionScope;
  status?: ExecutionStepStatus;
  result?: ExecutionStepResult;
}

export interface CreatePlanParams {
  planId?: string;
  taskId: string;
  employeeId: string;
  steps: readonly CreateStepParams[];
  status?: ExecutionPlanStatus;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export class ExecutionPlanFactory {
  /**
   * 不変な ExecutionPlan インスタンスを生成する
   */
  static createPlan(params: CreatePlanParams): ExecutionPlan {
    const nowIso = new Date().toISOString();
    const dateFormatted = nowIso.slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const planId = params.planId || `PLAN-${dateFormatted}-${randomSuffix}`;

    if (!Array.isArray(params.steps) || params.steps.length === 0) {
      throw new Error('[ExecutionPlanFactory] Execution plan must contain at least 1 step');
    }

    const processedSteps: ExecutionStep[] = params.steps.map((s, idx) => {
      const stepId = s.stepId || `STEP-${String(idx + 1).padStart(2, '0')}`;
      const result = s.result ? Object.freeze({ ...s.result }) : undefined;

      return Object.freeze({
        stepId,
        order: idx + 1,
        title: s.title,
        actionType: s.actionType,
        ...(s.requiredPermissionScope ? { requiredPermissionScope: s.requiredPermissionScope } : {}),
        status: s.status || ExecutionStepStatus.PENDING,
        ...(result ? { result } : {})
      });
    });

    const frozenSteps = Object.freeze(processedSteps);
    const metadata = params.metadata ? Object.freeze({ ...params.metadata }) : undefined;

    const plan: ExecutionPlan = Object.freeze({
      planId,
      taskId: params.taskId,
      employeeId: params.employeeId,
      steps: frozenSteps,
      status: params.status || ExecutionPlanStatus.READY,
      createdAt: params.createdAt || nowIso,
      updatedAt: params.updatedAt || params.createdAt || nowIso,
      ...(metadata ? { metadata } : {})
    });

    if (!ExecutionPlanValidator.validatePlan(plan)) {
      throw new Error(`[ExecutionPlanFactory] Invalid execution plan structure for plan ID: ${planId}`);
    }

    return plan;
  }
}
