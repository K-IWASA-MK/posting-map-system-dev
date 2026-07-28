/**
 * AIEmployeeExecutionRuntime.ts
 * 
 * AIOS AI Employee Execution Runtime Engine
 * 
 * タスク（ExecutionTask）および計画（ExecutionPlan & ExecutionStep）を決定論的順序で自律実行する。
 * 各ステップの 8 項目安全ポリシー確認、権限ゲート遮断（ExecutionPermissionGate）、
 * ステップハンドラ（ExecutionStepHandlerRegistry）、進行状態同期、自律検証（AIEmployeeVerificationOrchestrator）、
 * 証跡ストレージ（EvidenceStorageManager）、およびガバナンス Bridge（VerificationGovernanceGateBridge）との全自動統合。
 */

import {
  AIEmployeeVerificationOrchestrator,
  BrowserVerificationActionType,
  EvidenceStorageManager,
  VerificationCapability,
  VerificationCapabilityStatus,
  VerificationGovernanceGateBridge
} from '../verification';
import { ExecutionPermissionGate } from './ExecutionPermissionGate';
import {
  ExecutionPlanStatus,
  ExecutionStepResult,
  ExecutionStepStatus
} from './ExecutionPlanModel';
import { ExecutionPlanRegistry } from './ExecutionPlanRegistry';
import { ExecutionTaskStatus } from './ExecutionTaskModel';
import { ExecutionTaskRegistry } from './ExecutionTaskRegistry';
import { ExecutionStepHandlerRegistry } from './ExecutionStepHandlerRegistry';

export interface ExecutionRuntimeResult {
  readonly taskId: string;
  readonly planId: string;
  readonly taskStatus: ExecutionTaskStatus;
  readonly planStatus: ExecutionPlanStatus;
  readonly stepResults: readonly ExecutionStepResult[];
  readonly governanceDecision?: 'ALLOW' | 'BLOCK';
  readonly evidencePackagePath?: string;
  readonly reason: string;
}

export class AIEmployeeExecutionRuntime {
  /**
   * アサイン完了後のタスクおよび計画を自律実行し、自律検証・証跡保存・ガバナンス評価まで一括完遂する
   */
  static async executeTaskPlan(
    taskId: string,
    planId: string,
    employeeCapabilities: readonly VerificationCapability[] = []
  ): Promise<ExecutionRuntimeResult> {
    // 1. Task pre-check
    const task = ExecutionTaskRegistry.get(taskId);
    if (!task) {
      throw new Error(`[AIEmployeeExecutionRuntime] Task not found: ${taskId}`);
    }

    if (!task.assignedEmployeeId) {
      ExecutionTaskRegistry.updateStatus(taskId, ExecutionTaskStatus.BLOCKED, { reason: 'Task is not assigned to any AI employee' });
      return Object.freeze({
        taskId,
        planId,
        taskStatus: ExecutionTaskStatus.BLOCKED,
        planStatus: ExecutionPlanStatus.BLOCKED,
        stepResults: Object.freeze([]),
        reason: 'Task is not assigned to any AI employee'
      });
    }

    // 2. Plan pre-check
    const plan = ExecutionPlanRegistry.get(planId);
    if (!plan || plan.taskId !== taskId) {
      throw new Error(`[AIEmployeeExecutionRuntime] Execution plan ${planId} mismatch for task: ${taskId}`);
    }

    const employeeId = task.assignedEmployeeId;
    const stepResults: ExecutionStepResult[] = [];

    // 3. Set status to RUNNING & EXECUTING
    ExecutionTaskRegistry.updateStatus(taskId, ExecutionTaskStatus.RUNNING);
    ExecutionPlanRegistry.updatePlanStatus(planId, ExecutionPlanStatus.EXECUTING);

    const availableCapSet = new Set(
      employeeCapabilities.filter((c) => c.status === VerificationCapabilityStatus.AVAILABLE).map((c) => c.type)
    );

    // 4. Sequential Step Execution Loop
    for (const step of plan.steps) {
      // Pre-check 1: Handler Existence
      const handlerDef = ExecutionStepHandlerRegistry.getHandler(step.actionType);
      if (!handlerDef) {
        const failResult: ExecutionStepResult = {
          success: false,
          error: `Missing step handler for actionType: ${step.actionType}`
        };
        stepResults.push(failResult);
        ExecutionPlanRegistry.updateStepStatus(planId, step.stepId, ExecutionStepStatus.FAILED, failResult);
        ExecutionPlanRegistry.updatePlanStatus(planId, ExecutionPlanStatus.FAILED);
        ExecutionTaskRegistry.updateStatus(taskId, ExecutionTaskStatus.FAILED, { reason: failResult.error });

        return Object.freeze({
          taskId,
          planId,
          taskStatus: ExecutionTaskStatus.FAILED,
          planStatus: ExecutionPlanStatus.FAILED,
          stepResults: Object.freeze(stepResults),
          reason: failResult.error!
        });
      }

      // Pre-check 2: Permission Gate
      const requiredScope = step.requiredPermissionScope || handlerDef.requiredPermissionScope;
      if (requiredScope) {
        const permCheck = ExecutionPermissionGate.checkPermission(employeeId, requiredScope);
        if (!permCheck.allowed) {
          const blockResult: ExecutionStepResult = {
            success: false,
            error: permCheck.reason || `Permission DENIED for scope: ${requiredScope}`
          };
          stepResults.push(blockResult);
          ExecutionPlanRegistry.updateStepStatus(planId, step.stepId, ExecutionStepStatus.SKIPPED, blockResult);
          ExecutionPlanRegistry.updatePlanStatus(planId, ExecutionPlanStatus.BLOCKED);
          ExecutionTaskRegistry.updateStatus(taskId, ExecutionTaskStatus.BLOCKED, { reason: blockResult.error });

          return Object.freeze({
            taskId,
            planId,
            taskStatus: ExecutionTaskStatus.BLOCKED,
            planStatus: ExecutionPlanStatus.BLOCKED,
            stepResults: Object.freeze(stepResults),
            reason: blockResult.error!
          });
        }
      }

      // Pre-check 3: Capability Check
      const requiredCap = handlerDef.requiredCapability;
      if (requiredCap && !availableCapSet.has(requiredCap)) {
        const capBlockResult: ExecutionStepResult = {
          success: false,
          error: `Required capability UNAVAILABLE: ${requiredCap}`
        };
        stepResults.push(capBlockResult);
        ExecutionPlanRegistry.updateStepStatus(planId, step.stepId, ExecutionStepStatus.SKIPPED, capBlockResult);
        ExecutionPlanRegistry.updatePlanStatus(planId, ExecutionPlanStatus.BLOCKED);
        ExecutionTaskRegistry.updateStatus(taskId, ExecutionTaskStatus.BLOCKED, { reason: capBlockResult.error });

        return Object.freeze({
          taskId,
          planId,
          taskStatus: ExecutionTaskStatus.BLOCKED,
          planStatus: ExecutionPlanStatus.BLOCKED,
          stepResults: Object.freeze(stepResults),
          reason: capBlockResult.error!
        });
      }

      // Execute Step
      ExecutionPlanRegistry.updateStepStatus(planId, step.stepId, ExecutionStepStatus.RUNNING);
      const startTime = Date.now();
      let res: ExecutionStepResult;
      try {
        res = await handlerDef.handler(step, task);
      } catch (err: any) {
        res = {
          success: false,
          error: `Step execution exception: ${err.message}`,
          durationMs: Date.now() - startTime
        };
      }

      stepResults.push(res);

      if (!res.success) {
        ExecutionPlanRegistry.updateStepStatus(planId, step.stepId, ExecutionStepStatus.FAILED, res);
        ExecutionPlanRegistry.updatePlanStatus(planId, ExecutionPlanStatus.FAILED);
        ExecutionTaskRegistry.updateStatus(taskId, ExecutionTaskStatus.FAILED, { reason: res.error });

        return Object.freeze({
          taskId,
          planId,
          taskStatus: ExecutionTaskStatus.FAILED,
          planStatus: ExecutionPlanStatus.FAILED,
          stepResults: Object.freeze(stepResults),
          reason: res.error || `Step ${step.stepId} failed`
        });
      }

      ExecutionPlanRegistry.updateStepStatus(planId, step.stepId, ExecutionStepStatus.COMPLETED, {
        ...res,
        durationMs: res.durationMs || (Date.now() - startTime)
      });
    }

    // 5. All Steps PASSED -> Transition Task Status to VERIFYING
    ExecutionTaskRegistry.updateStatus(taskId, ExecutionTaskStatus.VERIFYING);

    // 6. Invoke Verification Runtime Orchestration
    const defaultRepo = 'aios-org/aios-app-repository';
    const defaultUrl = 'https://aios-org.github.io/aios-app-repository/';
    const orchestrator = new AIEmployeeVerificationOrchestrator();
    const orchestratorResult = await orchestrator.executeTaskVerification({
      taskId,
      gitCommit: task.metadata?.expectedCommit || '0f3f6c9a8e4a',
      deploymentRequest: {
        verificationId: `dep-${taskId}`,
        repository: task.metadata?.repository || defaultRepo,
        productionUrl: task.metadata?.productionUrl || defaultUrl,
        expectedCommit: task.metadata?.expectedCommit || '0f3f6c9a8e4a'
      },
      browserRequest: {
        verificationId: `br-${taskId}`,
        targetUrl: task.metadata?.productionUrl || defaultUrl,
        actions: Object.freeze([
          { type: BrowserVerificationActionType.NAVIGATE, target: task.metadata?.productionUrl || defaultUrl }
        ])
      }
    });

    // 7. Persist Evidence Package & Cryptographic Integrity Manifest
    const evidenceSaveResult = await EvidenceStorageManager.saveEvidencePackage(orchestratorResult.evidencePackage);

    // 8. Evaluate Completion Gate via Governance Bridge
    const governanceEval = VerificationGovernanceGateBridge.evaluateCompletionGate(
      orchestratorResult.evidencePackage,
      evidenceSaveResult.packageDir
    );

    const finalSuccess = governanceEval.decision === 'ALLOW';
    const finalTaskStatus = finalSuccess ? ExecutionTaskStatus.COMPLETED : ExecutionTaskStatus.BLOCKED;
    const finalPlanStatus = finalSuccess ? ExecutionPlanStatus.COMPLETED : ExecutionPlanStatus.BLOCKED;

    ExecutionTaskRegistry.updateStatus(taskId, finalTaskStatus, {
      governanceDecision: governanceEval.decision,
      evidencePath: evidenceSaveResult.manifestPath
    });
    ExecutionPlanRegistry.updatePlanStatus(planId, finalPlanStatus);

    return Object.freeze({
      taskId,
      planId,
      taskStatus: finalTaskStatus,
      planStatus: finalPlanStatus,
      stepResults: Object.freeze(stepResults),
      governanceDecision: governanceEval.decision,
      evidencePackagePath: evidenceSaveResult.packageDir,
      reason: governanceEval.reason
    });
  }
}
