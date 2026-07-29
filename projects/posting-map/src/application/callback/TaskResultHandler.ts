/**
 * TaskResultHandler.ts
 * Handles the validated TaskResult and forwards it to the EventBus.
 */
import { TaskResultPayload } from '../../integration/aios/callback/TaskResultPayload';
import { TaskResultMapper } from './TaskResultMapper';

export interface IEventBus {
  publish(event: any): void;
}

export class TaskResultHandler {
  constructor(private eventBus: IEventBus) {}

  async handle(taskResult: TaskResultPayload): Promise<void> {
    const internalPayload = TaskResultMapper.toInternalEventPayload(taskResult);
    
    // We only publish to EventBus as specified.
    // Dashboard, Repository, LINE notifications will subscribe to this event later.
    this.eventBus.publish({ type: 'POSTINGMAP_TASK_COMPLETED', payload: internalPayload });
  }
}
