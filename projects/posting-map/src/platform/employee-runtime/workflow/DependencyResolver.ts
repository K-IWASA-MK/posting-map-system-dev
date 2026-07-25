/**
 * AIOS Employee Workflow Orchestration Foundation
 * Dependency Resolver Implementation
 */

import { IDependencyResolver } from './contract/IEmployeeWorkflow';
import { WorkflowRecord, WorkflowTask } from './models/EmployeeWorkflowModels';

export class DependencyResolver implements IDependencyResolver {
  public validateDependencies(workflow: WorkflowRecord): { valid: boolean; reason?: string } {
    const taskIds = new Set(workflow.tasks.map((t) => t.taskId));

    // 1. Check duplicate TaskIds
    if (taskIds.size !== workflow.tasks.length) {
      return { valid: false, reason: '[Dependency Resolver Block] Duplicate taskId detected in Workflow definition.' };
    }

    // 2. Check non-existent Task references in dependencies
    for (const dep of workflow.dependencies) {
      if (!taskIds.has(dep.taskId) || !taskIds.has(dep.dependsOnTaskId)) {
        return {
          valid: false,
          reason: `[Dependency Resolver Block] Dependency references non-existent taskId: '${dep.taskId}' -> '${dep.dependsOnTaskId}'.`,
        };
      }
    }

    // 3. Detect Circular Dependencies (Tarjan's / DFS Cycle Detection)
    const adj = new Map<string, string[]>();
    for (const id of taskIds) {
      adj.set(id, []);
    }
    for (const dep of workflow.dependencies) {
      adj.get(dep.dependsOnTaskId)?.push(dep.taskId);
    }

    const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited

    const hasCycle = (node: string): boolean => {
      visited.set(node, 1);
      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        const state = visited.get(neighbor) || 0;
        if (state === 1) return true; // Cycle found
        if (state === 0 && hasCycle(neighbor)) return true;
      }
      visited.set(node, 2);
      return false;
    };

    for (const id of taskIds) {
      if ((visited.get(id) || 0) === 0) {
        if (hasCycle(id)) {
          return {
            valid: false,
            reason: `[Dependency Resolver Block] Circular dependency detected involving taskId '${id}'.`,
          };
        }
      }
    }

    return { valid: true };
  }

  public getReadyTasks(workflow: WorkflowRecord): WorkflowTask[] {
    const completedTaskIds = new Set(
      workflow.tasks.filter((t) => t.status === 'COMPLETED').map((t) => t.taskId)
    );

    return workflow.tasks.filter((task) => {
      if (task.status !== 'PENDING') return false;

      // Find all prerequisites for this task
      const prereqs = workflow.dependencies
        .filter((d) => d.taskId === task.taskId)
        .map((d) => d.dependsOnTaskId);

      // Task is READY if all prerequisites are COMPLETED
      return prereqs.every((pId) => completedTaskIds.has(pId));
    });
  }
}
