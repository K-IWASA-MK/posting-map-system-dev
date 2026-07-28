/**
 * TaskOrchestrationListener.ts
 * 
 * AIOS Task Orchestration Listener
 * 
 * TASK_CREATED イベントを監視し、イベント駆動で AIEmployeeTaskOrchestrator を自動起動するリスナー。
 * オーケストレーション完了時に TASK_COMPLETED / TASK_FAILED / TASK_BLOCKED イベントを発行する。
 */

import { AIEmployeeRegistry } from '../../employee/manager/registry/AIEmployeeRegistry';
import { AutonomousRuntimeEventBus } from '../../runtime/events/AutonomousRuntimeEventBus';
import { RuntimeEvent, RuntimeEventType, TaskCompletionPayload, TaskCreatedPayload } from '../../runtime/events/RuntimeEventModel';
import { AIEmployeeTaskOrchestrator } from './AIEmployeeTaskOrchestrator';

export class TaskOrchestrationListener {
  private static unsubscribeFunc: (() => void) | null = null;
  private static isListening: boolean = false;
  private static registry: AIEmployeeRegistry | null = null;
  private static orchestrator: AIEmployeeTaskOrchestrator = new AIEmployeeTaskOrchestrator();

  /**
   * Listener の起動設定（AIEmployeeRegistry インスタンスの紐付け）
   */
  static configure(registry: AIEmployeeRegistry, orchestrator?: AIEmployeeTaskOrchestrator): void {
    this.registry = registry;
    if (orchestrator) {
      this.orchestrator = orchestrator;
    }
  }

  /**
   * TASK_CREATED イベントのリスナー登録を開始する
   */
  static startListening(): void {
    if (this.isListening) {
      return;
    }

    this.unsubscribeFunc = AutonomousRuntimeEventBus.subscribe<TaskCreatedPayload>(
      RuntimeEventType.TASK_CREATED,
      async (event: RuntimeEvent<TaskCreatedPayload>) => {
        if (!this.registry) {
          console.warn('[TaskOrchestrationListener] AIEmployeeRegistry not configured before handling TASK_CREATED event');
          return;
        }

        const taskId = event.payload.taskId;
        try {
          // Trigger Autonomous Task Orchestrator
          const result = await this.orchestrator.orchestrate(taskId, this.registry);

          // Publish Outcome Event to AutonomousRuntimeEventBus
          let completionEventType = RuntimeEventType.TASK_COMPLETED;
          if (result.taskStatus === 'FAILED' as any) {
            completionEventType = RuntimeEventType.TASK_FAILED;
          } else if (result.taskStatus === 'BLOCKED' as any) {
            completionEventType = RuntimeEventType.TASK_BLOCKED;
          }

          const completionEvent: RuntimeEvent<TaskCompletionPayload> = {
            eventId: `evt-task-completed-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: completionEventType,
            timestamp: new Date().toISOString(),
            payload: {
              taskId: result.taskId,
              planId: result.planId,
              assignedEmployeeId: result.assignedEmployeeId,
              status: result.taskStatus,
              governanceDecision: result.executionResult?.governanceDecision,
              evidencePath: result.executionResult?.evidencePackagePath,
              reason: result.reason
            }
          };

          await AutonomousRuntimeEventBus.publish(completionEvent);
        } catch (err: any) {
          console.error(`[TaskOrchestrationListener] Orchestration failed for task ${taskId}:`, err);
          const failEvent: RuntimeEvent<TaskCompletionPayload> = {
            eventId: `evt-task-failed-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: RuntimeEventType.TASK_FAILED,
            timestamp: new Date().toISOString(),
            payload: {
              taskId,
              status: 'FAILED',
              reason: err.message || 'Orchestration execution exception'
            }
          };
          await AutonomousRuntimeEventBus.publish(failEvent);
        }
      }
    );

    this.isListening = true;
  }

  /**
   * リスナー登録を解除する
   */
  static stopListening(): void {
    if (this.unsubscribeFunc) {
      this.unsubscribeFunc();
      this.unsubscribeFunc = null;
    }
    this.isListening = false;
  }

  /**
   * 動作状態を取得する
   */
  static getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * クリアを行う（テスト用）
   */
  static clear(): void {
    this.stopListening();
    this.registry = null;
  }
}
