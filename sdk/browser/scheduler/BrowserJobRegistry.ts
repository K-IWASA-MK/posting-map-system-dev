import { ScheduledJob } from './types/ScheduledJob';

export class BrowserJobRegistry {
  private jobs: Map<string, ScheduledJob> = new Map();

  public registerJob(job: ScheduledJob): void {
    this.jobs.set(job.jobId, job);
  }

  public getJob(jobId: string): ScheduledJob | undefined {
    return this.jobs.get(jobId);
  }

  public getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  public unregisterJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }
}
