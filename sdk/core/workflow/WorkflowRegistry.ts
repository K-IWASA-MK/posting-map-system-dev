import { WorkflowDefinition, WorkflowVersion } from './WorkflowModels';

export class WorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();
  private versions = new Map<string, WorkflowVersion[]>();

  public registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.workflowId, workflow);
  }

  public getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  public registerVersion(version: WorkflowVersion): void {
    const list = this.versions.get(version.workflowId) || [];
    list.push(version);
    this.versions.set(version.workflowId, list);
  }

  public getVersions(workflowId: string): WorkflowVersion[] {
    return this.versions.get(workflowId) || [];
  }

  public removeWorkflow(workflowId: string): void {
    this.workflows.delete(workflowId);
  }
}
