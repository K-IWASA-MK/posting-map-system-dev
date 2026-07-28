/**
 * TaskCreatedEventPublisher.ts
 * 
 * AIOS Task Created Event Publisher
 * 
 * ExecutionTask 受託登録時に TASK_CREATED イベントを構築し、
 * AutonomousRuntimeEventBus へ発行（Publish）する専用パブリッシャー。
 */

import { ExecutionTask } from '../../execution/ExecutionTaskModel';
import { AutonomousRuntimeEventBus } from './AutonomousRuntimeEventBus';
import { RuntimeEvent, RuntimeEventType, TaskCreatedPayload } from './RuntimeEventModel';

export class TaskCreatedEventPublisher {
  /**
   * 受託登録された ExecutionTask から TASK_CREATED イベントを発行する
   */
  static async publish(task: ExecutionTask): Promise<RuntimeEvent<TaskCreatedPayload>> {
    if (!task || !task.taskId) {
      throw new Error('[TaskCreatedEventPublisher] Cannot publish TASK_CREATED event for invalid task');
    }

    const event: RuntimeEvent<TaskCreatedPayload> = {
      eventId: `evt-task-created-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: RuntimeEventType.TASK_CREATED,
      timestamp: new Date().toISOString(),
      payload: {
        taskId: task.taskId,
        title: task.title,
        priority: task.priority,
        requiredCapabilities: task.requiredCapabilities || [],
        metadata: task.metadata
      }
    };

    await AutonomousRuntimeEventBus.publish(event);
    return event;
  }
}
