import { WorkflowManifest } from './WorkflowManifest';
import { WorkflowJob } from './WorkflowModels';

export class WorkflowRegistry {
  private readonly manifests: Map<string, WorkflowManifest> = new Map();
  private readonly activeJobs: Map<string, WorkflowJob> = new Map();

  public registerManifest(manifest: WorkflowManifest): void {
    this.manifests.set(manifest.workflowId, manifest);
  }

  public getManifest(workflowId: string): WorkflowManifest | undefined {
    return this.manifests.get(workflowId);
  }

  public registerJob(job: WorkflowJob): void {
    this.activeJobs.set(job.id, job);
  }

  public getJob(jobId: string): WorkflowJob | undefined {
    return this.activeJobs.get(jobId);
  }

  public removeJob(jobId: string): void {
    this.activeJobs.delete(jobId);
  }

  public getAllManifests(): WorkflowManifest[] {
    return Array.from(this.manifests.values());
  }
}
