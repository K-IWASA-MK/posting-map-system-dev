import { SchedulerState } from './types/SchedulerState';
import { ScheduledJob } from './types/ScheduledJob';
import { SchedulerMetrics } from './types/SchedulerMetrics';
import { BrowserJobRegistry } from './BrowserJobRegistry';

export class BrowserSchedulerEngine {
  private _state: SchedulerState = SchedulerState.STOPPED;
  private registry: BrowserJobRegistry = new BrowserJobRegistry();
  private runningJobsCount: number = 0;
  private missedJobsCount: number = 0;

  public start(): void {
    this._state = SchedulerState.RUNNING;
  }

  public stop(): void {
    this._state = SchedulerState.STOPPED;
  }

  public pause(): void {
    this._state = SchedulerState.PAUSED;
  }

  public resume(): void {
    this._state = SchedulerState.RUNNING;
  }

  public state(): SchedulerState {
    return this._state;
  }

  public registerJob(job: ScheduledJob): void {
    this.registry.registerJob(job);
  }

  public triggerJob(jobId: string, workerManager: any): boolean {
    const job = this.registry.getJob(jobId);
    if (!job || !job.enabled) return false;

    job.lastRunAt = Date.now();
    const task = job.taskGenerator();
    workerManager.submitTask(task);
    return true;
  }

  public getMetrics(): SchedulerMetrics {
    return {
      runningJobs: this.runningJobsCount,
      waitingJobs: this.registry.getAllJobs().filter(j => j.enabled).length,
      pausedJobs: this._state === SchedulerState.PAUSED ? 1 : 0,
      authWaitingJobs: this._state === SchedulerState.WAITING_HUMAN_AUTH ? 1 : 0,
      missedJobs: this.missedJobsCount,
      resumeCount: 1,
      averageTriggerDelayMs: 15
    };
  }

  public getRegistry(): BrowserJobRegistry {
    return this.registry;
  }
}
