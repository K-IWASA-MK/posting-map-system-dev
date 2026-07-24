import { BrowserTaskQueue } from './BrowserTaskQueue';
import { BrowserLockManager } from './BrowserLockManager';
import { BrowserTask } from './types/BrowserTask';
import { BrowserTaskState } from './types/BrowserTaskState';
import { BrowserWorkerMetrics } from './types/BrowserWorkerMetrics';
import { LockAcquisitionFailedException, WorkerTaskTimeoutException } from './exceptions/BrowserWorkerExceptions';

export class BrowserWorkerDispatcher {
  private taskQueue: BrowserTaskQueue = new BrowserTaskQueue();
  private lockManager: BrowserLockManager = new BrowserLockManager();
  private runningTasks: Map<string, BrowserTask> = new Map();
  private completedCount: number = 0;
  private failedCount: number = 0;
  private totalWaitTimeMs: number = 0;
  private totalExecTimeMs: number = 0;
  private timeoutCount: number = 0;
  private retryCount: number = 0;

  public submitTask(task: BrowserTask): void {
    this.taskQueue.enqueue(task);
  }

  public async processNext(browserRuntime: any): Promise<boolean> {
    const task = this.taskQueue.peek();
    if (!task) return false;

    task.state = BrowserTaskState.WAITING_FOR_LOCK;

    try {
      this.lockManager.acquireLock(task.scope, task.targetKey, task.agentId);
    } catch (e) {
      if (e instanceof LockAcquisitionFailedException) {
        // Remain in queue for fair scheduling retry
        return false;
      }
      throw e;
    }

    // Lock acquired
    this.taskQueue.dequeue();
    task.state = BrowserTaskState.RUNNING;
    this.runningTasks.set(task.id, task);

    const startTime = Date.now();
    const waitMs = startTime - task.enqueuedAt;
    this.totalWaitTimeMs += waitMs;

    try {
      // Worker Isolation: Enclose in safe try/catch sandbox
      task.result = await task.action(browserRuntime);
      task.state = BrowserTaskState.COMPLETED;
      this.completedCount++;
      const execMs = Date.now() - startTime;
      this.totalExecTimeMs += execMs;
      return true;
    } catch (err: any) {
      task.error = err.message || err.toString();
      
      if (task.attemptsCount < task.retryPolicy.maxAttempts) {
        task.attemptsCount++;
        this.retryCount++;
        task.state = BrowserTaskState.QUEUED;
        this.taskQueue.enqueue(task);
      } else {
        task.state = BrowserTaskState.FAILED;
        this.failedCount++;
      }
      return false;
    } finally {
      this.lockManager.releaseLock(task.scope, task.targetKey, task.agentId);
      this.runningTasks.delete(task.id);
    }
  }

  public cancelTask(taskId: string): boolean {
    return this.taskQueue.cancelTask(taskId);
  }

  public cancelAgentTasks(agentId: string): number {
    return this.taskQueue.cancelAgentTasks(agentId);
  }

  public cancelAll(): number {
    return this.taskQueue.cancelAll();
  }

  public getMetrics(): BrowserWorkerMetrics {
    const totalProcessed = this.completedCount + this.failedCount;
    return {
      queueLength: this.taskQueue.size(),
      averageWaitTimeMs: totalProcessed > 0 ? Math.round(this.totalWaitTimeMs / totalProcessed) : 0,
      averageExecutionTimeMs: this.completedCount > 0 ? Math.round(this.totalExecTimeMs / this.completedCount) : 0,
      lockContentionCount: this.lockManager.getContentionCount(),
      timeoutCount: this.timeoutCount,
      retryCount: this.retryCount,
      deadlockRecoveryCount: this.lockManager.getDeadlockRecoveryCount()
    };
  }

  public getQueue(): BrowserTaskQueue {
    return this.taskQueue;
  }

  public getLockManager(): BrowserLockManager {
    return this.lockManager;
  }
}
