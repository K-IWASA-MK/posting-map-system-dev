import { ISchedulerOrderingStrategy } from './ISchedulerOrderingStrategy';
import { SchedulerTask } from './SchedulerTask';

/**
 * PriorityOrderingStrategy sorts tasks first by priority weight (high > normal > low) and then FIFO timestamp order.
 */
export class PriorityOrderingStrategy implements ISchedulerOrderingStrategy {
  private readonly priorityWeights = {
    high: 3,
    normal: 2,
    low: 1
  };

  public compare(a: SchedulerTask, b: SchedulerTask): number {
    const weightA = this.priorityWeights[a.priority];
    const weightB = this.priorityWeights[b.priority];

    if (weightA !== weightB) {
      // Descending order (higher priority comes first)
      return weightB - weightA;
    }

    // Ascending order (FIFO for matching priority)
    return a.enqueuedAt - b.enqueuedAt;
  }
}
