import { SchedulerTask } from './SchedulerTask';
import { DispatchResult } from './DispatchResult';

/**
 * ISessionDispatcher abstracts the invocation trigger for queued tasks.
 */
export interface ISessionDispatcher {
  /**
   * Executes process/session allocations.
   * @param task target task description block.
   */
  dispatch(task: SchedulerTask): Promise<DispatchResult>;
}
