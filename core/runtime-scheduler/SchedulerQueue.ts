import { SchedulerTask } from './SchedulerTask';
import { ISchedulerOrderingStrategy } from './ISchedulerOrderingStrategy';

/**
 * SchedulerQueue manages queued tasks sorted automatically by the injected strategy.
 */
export class SchedulerQueue {
  private readonly tasks: SchedulerTask[] = [];
  private readonly strategy: ISchedulerOrderingStrategy;

  constructor(strategy: ISchedulerOrderingStrategy) {
    this.strategy = strategy;
  }

  /**
   * Pushes a new task and sorts the internal array using the ordering strategy.
   * @param task 불변 task block.
   */
  public enqueue(task: SchedulerTask): void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => this.strategy.compare(a, b));
  }

  /**
   * Pops the front-most sorted task.
   */
  public dequeue(): SchedulerTask | undefined {
    return this.tasks.shift();
  }

  /**
   * Returns total items currently stored.
   */
  public size(): number {
    return this.tasks.length;
  }

  /**
   * Cleans out all queued items.
   */
  public clear(): void {
    this.tasks.length = 0;
  }
}
