/**
 * WorkflowRegistry.ts
 * 
 * Pure Registry for EmployeeWorkflow definitions (register, find, remove, getAll, clear)
 */

import { EmployeeWorkflow } from '../types/EmployeeWorkflow';

export class WorkflowRegistry {
  private static workflows: Map<string, EmployeeWorkflow> = new Map();

  public static register(workflow: EmployeeWorkflow): void {
    const key = workflow.workflowId.getValue();
    this.workflows.set(key, workflow);
  }

  public static find(workflowId: string): EmployeeWorkflow | undefined {
    return this.workflows.get(workflowId.trim().toUpperCase());
  }

  public static remove(workflowId: string): boolean {
    return this.workflows.delete(workflowId.trim().toUpperCase());
  }

  public static getAll(): EmployeeWorkflow[] {
    return Array.from(this.workflows.values());
  }

  public static clear(): void {
    this.workflows.clear();
  }
}
