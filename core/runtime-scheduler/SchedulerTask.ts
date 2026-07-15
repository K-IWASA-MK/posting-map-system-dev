import { SchedulerPriority } from './SchedulerPriority';
import { SchedulerTaskPayload } from './SchedulerTaskPayload';

/**
 * SchedulerTask represents a single unit of execution stored inside the queue.
 */
export interface SchedulerTask {
  readonly taskId: string;
  readonly projectId: string;
  readonly priority: SchedulerPriority;
  readonly payload: SchedulerTaskPayload;
  readonly enqueuedAt: number;
}
