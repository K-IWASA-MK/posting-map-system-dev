/**
 * DispatchPolicy.ts
 * 
 * Implements Principle 001 (AI Workforce Dispatch Principle) and Principle 006 (Project Autonomy Principle).
 * Models the specialist dispatch life cycle: AI Employees enter project context, perform tasks, and return all results to project.
 */

export interface DispatchRequirement {
  readonly projectId: string;
  readonly employeeId: string;
  readonly taskId: string;
  readonly returnArtifactsToProject: true;
  readonly zeroPlatformStateRetention: true;
  readonly respectProjectAutonomy: true;
}

export class DispatchPolicy {
  public static createDispatchRequirement(projectId: string, employeeId: string, taskId: string): DispatchRequirement {
    return Object.freeze({
      projectId,
      employeeId,
      taskId,
      returnArtifactsToProject: true,
      zeroPlatformStateRetention: true,
      respectProjectAutonomy: true
    });
  }

  public static validateDispatch(requirement: DispatchRequirement): { valid: boolean; reason?: string } {
    if (!requirement.returnArtifactsToProject) {
      return { valid: false, reason: 'Dispatch policy requires mandatory artifact return to project.' };
    }
    if (!requirement.zeroPlatformStateRetention) {
      return { valid: false, reason: 'Dispatch policy requires zero platform state retention.' };
    }
    if (!requirement.respectProjectAutonomy) {
      return { valid: false, reason: 'Dispatch policy requires explicit respect for project autonomy.' };
    }
    return { valid: true };
  }
}
