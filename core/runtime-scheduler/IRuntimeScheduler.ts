import { SchedulerTask } from './SchedulerTask';
import { SchedulerState } from './SchedulerState';
import { SchedulerMetrics } from './SchedulerMetrics';

/**
 * IRuntimeScheduler specifies scheduling controls and metric queries.
 */
export interface IRuntimeScheduler {
  /**
   * Submits a task to be run immediately or queued.
   * @param task target execution task payload.
   */
  schedule(task: SchedulerTask): void;

  /**
   * Returns current running status.
   */
  getState(): SchedulerState;

  /**
   * Returns queue size statistics.
   */
  getMetrics(): SchedulerMetrics;

  /**
   * Disables queue operations and cleans subscriptions.
   */
  stop(): void;
}
