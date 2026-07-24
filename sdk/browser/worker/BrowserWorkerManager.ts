import { BrowserWorkerDispatcher } from './BrowserWorkerDispatcher';
import { BrowserTask } from './types/BrowserTask';
import { BrowserWorkerMetrics } from './types/BrowserWorkerMetrics';

export class BrowserWorkerManager {
  private static instance: BrowserWorkerManager | null = null;
  private dispatcher: BrowserWorkerDispatcher;

  private constructor() {
    this.dispatcher = new BrowserWorkerDispatcher();
  }

  public static getInstance(): BrowserWorkerManager {
    if (!BrowserWorkerManager.instance) {
      BrowserWorkerManager.instance = new BrowserWorkerManager();
    }
    return BrowserWorkerManager.instance;
  }

  public static resetInstance(): void {
    BrowserWorkerManager.instance = null;
  }

  public submitTask(task: BrowserTask): void {
    this.dispatcher.submitTask(task);
  }

  public async processNext(browserRuntime: any): Promise<boolean> {
    return await this.dispatcher.processNext(browserRuntime);
  }

  public cancelTask(taskId: string): boolean {
    return this.dispatcher.cancelTask(taskId);
  }

  public cancelAgentTasks(agentId: string): number {
    return this.dispatcher.cancelAgentTasks(agentId);
  }

  public cancelAll(): number {
    return this.dispatcher.cancelAll();
  }

  public getMetrics(): BrowserWorkerMetrics {
    return this.dispatcher.getMetrics();
  }

  public getDispatcher(): BrowserWorkerDispatcher {
    return this.dispatcher;
  }
}
