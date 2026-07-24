import { BrowserTask } from './types/BrowserTask';
import { BrowserTaskState } from './types/BrowserTaskState';
import { BrowserWorkerPolicy } from './policy/BrowserWorkerPolicy';

export class BrowserTaskQueue {
  private queue: BrowserTask[] = [];

  public enqueue(task: BrowserTask): void {
    BrowserWorkerPolicy.validateQueueCapacity(this.queue.length);
    task.state = BrowserTaskState.QUEUED;
    if (!task.enqueuedAt) {
      task.enqueuedAt = Date.now();
    }
    task.agingScore = 0;
    this.queue.push(task);
    this.applyFairScheduler();
  }

  public dequeue(): BrowserTask | undefined {
    this.applyFairScheduler();
    return this.queue.shift();
  }

  public peek(): BrowserTask | undefined {
    this.applyFairScheduler();
    return this.queue[0];
  }

  public size(): number {
    return this.queue.length;
  }

  public cancelTask(taskId: string): boolean {
    const idx = this.queue.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      this.queue[idx].state = BrowserTaskState.CANCELLED;
      this.queue.splice(idx, 1);
      return true;
    }
    return false;
  }

  public cancelAgentTasks(agentId: string): number {
    const initial = this.queue.length;
    this.queue = this.queue.filter(t => {
      if (t.agentId === agentId) {
        t.state = BrowserTaskState.CANCELLED;
        return false;
      }
      return true;
    });
    return initial - this.queue.length;
  }

  public cancelAll(): number {
    const count = this.queue.length;
    this.queue.forEach(t => t.state = BrowserTaskState.CANCELLED);
    this.queue = [];
    return count;
  }

  /**
   * Fair Scheduling Algorithm:
   * Combines base priority (HIGH=100, NORMAL=50, BACKGROUND=10) with Aging score
   * to prevent starvation of BACKGROUND tasks in long-running 24/7 environments.
   */
  public applyFairScheduler(): void {
    const now = Date.now();
    const AGING_FACTOR_PER_SEC = 5;

    this.queue.forEach(task => {
      const waitSec = Math.floor((now - task.enqueuedAt) / 1000);
      task.agingScore = waitSec * AGING_FACTOR_PER_SEC;
    });

    this.queue.sort((a, b) => {
      const baseA = a.priority === 'HIGH' ? 100 : (a.priority === 'NORMAL' ? 50 : 10);
      const baseB = b.priority === 'HIGH' ? 100 : (b.priority === 'NORMAL' ? 50 : 10);

      const totalA = baseA + a.agingScore;
      const totalB = baseB + b.agingScore;

      return totalB - totalA;
    });
  }

  public getTasks(): ReadonlyArray<BrowserTask> {
    return [...this.queue];
  }
}
