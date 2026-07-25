/**
 * AIOS Employee Workflow Orchestration Foundation
 * Workflow Registry Engine Implementation (Definition Freeze & Version Control)
 */

import { DependencyResolver } from './DependencyResolver';
import { IWorkflowRegistry } from './contract/IEmployeeWorkflow';
import { WorkflowRecord, WorkflowTask } from './models/EmployeeWorkflowModels';

export class WorkflowRegistryEngine implements IWorkflowRegistry {
  private workflows: Map<string, WorkflowRecord> = new Map();
  private resolver = new DependencyResolver();

  public registerWorkflow(workflow: WorkflowRecord): WorkflowRecord {
    // 1. Validate Dependency Integrity (Gate 2)
    const valRes = this.resolver.validateDependencies(workflow);
    if (!valRes.valid) {
      throw new Error(valRes.reason);
    }

    // 2. Reject Duplicate WorkflowId (Gate 1: Definition Freeze)
    if (this.workflows.has(workflow.workflowId)) {
      throw new Error(
        `[Workflow Registry Block] WorkflowId '${workflow.workflowId}' already registered. Direct modification/overwrite forbidden (Gate 1).`
      );
    }

    // 3. Freeze Record (Immutability)
    const frozenRecord: WorkflowRecord = Object.freeze({
      ...workflow,
      version: workflow.version || 1,
      status: workflow.status || 'CREATED',
      tasks: Object.freeze(workflow.tasks.map((t) => Object.freeze({ ...t }))),
      dependencies: Object.freeze(workflow.dependencies.map((d) => Object.freeze({ ...d }))),
    });

    this.workflows.set(workflow.workflowId, frozenRecord);
    return frozenRecord;
  }

  public createNewVersion(
    workflowId: string,
    updatedTasks: WorkflowTask[]
  ): WorkflowRecord {
    const existing = this.getWorkflow(workflowId);

    const newVersion = existing.version + 1;
    const newWorkflowId = `${existing.workflowName.toLowerCase().replace(/\s+/g, '_')}_v${newVersion}`;

    if (this.workflows.has(newWorkflowId)) {
      throw new Error(`[Workflow Registry Block] WorkflowId '${newWorkflowId}' already exists.`);
    }

    const newRecord: WorkflowRecord = Object.freeze({
      ...existing,
      workflowId: newWorkflowId,
      version: newVersion,
      tasks: Object.freeze(updatedTasks.map((t) => Object.freeze({ ...t }))),
      createdAt: new Date().toISOString(),
    });

    // Validate new version dependencies
    const valRes = this.resolver.validateDependencies(newRecord);
    if (!valRes.valid) {
      throw new Error(valRes.reason);
    }

    this.workflows.set(newWorkflowId, newRecord);
    return newRecord;
  }

  public getWorkflow(workflowId: string): WorkflowRecord {
    const record = this.workflows.get(workflowId);
    if (!record) {
      throw new Error(`[Workflow Registry Block] WorkflowId '${workflowId}' not found.`);
    }
    return record;
  }

  public listWorkflows(): WorkflowRecord[] {
    return Array.from(this.workflows.values());
  }
}
