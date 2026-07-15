import { SchedulerTask } from './SchedulerTask';

/**
 * ISchedulerOrderingStrategy defines ordering constraints for items sorted in the scheduler queue.
 */
export interface ISchedulerOrderingStrategy {
  /**
   * Returns a negative value if 'a' should precede 'b', positive if 'b' first, 0 if equal.
   */
  compare(a: SchedulerTask, b: SchedulerTask): number;
}
