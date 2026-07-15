import { DeploymentJob, DeploymentState } from './DeploymentModels';

export interface DeploymentRegistry {
  register(job: DeploymentJob): void;
  getById(jobId: string): DeploymentJob | undefined;
  update(jobId: string, updates: Partial<DeploymentJob>): void;
}

export class InMemoryDeploymentRegistry implements DeploymentRegistry {
  private jobs = new Map<string, DeploymentJob>();

  public register(job: DeploymentJob): void {
    if (this.jobs.has(job.id)) {
      throw new Error(`Job ${job.id} already exists`);
    }
    this.jobs.set(job.id, job);
  }

  public getById(jobId: string): DeploymentJob | undefined {
    return this.jobs.get(jobId);
  }

  public update(jobId: string, updates: Partial<DeploymentJob>): void {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    this.jobs.set(jobId, { ...job, ...updates, updatedAt: new Date().toISOString() });
  }
}
