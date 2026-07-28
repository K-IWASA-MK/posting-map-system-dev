/**
 * AssignmentPlanner.ts
 * 
 * Formulates WorkerAssignment and SupervisorDirectives
 */

import { AssignmentPriority, WorkerAssignment } from '../types/WorkerAssignment';
import { SupervisorDirective } from '../types/SupervisorDirective';
import { SelectedWorkerResult } from './WorkerSelector';

export class AssignmentPlanner {
  public static planAssignment(
    supervisorId: string,
    taskId: string,
    selectionResult: SelectedWorkerResult,
    priority: AssignmentPriority = AssignmentPriority.STANDARD
  ): WorkerAssignment {
    const directive: SupervisorDirective = {
      directiveId: `dir-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      supervisorId,
      workerId: selectionResult.worker.profile.identity.employeeId,
      taskId,
      instructions: [
        `Execute task ${taskId} autonomously`,
        `Maintain evidence verification for governance`
      ],
      constraints: [
        `Do not violate assigned permissions`,
        `Report completion upon verification ALLOW`
      ],
      createdTimestamp: new Date().toISOString()
    };

    return {
      assignmentId: `asgn-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      taskId,
      supervisorId,
      workerId: selectionResult.worker.profile.identity.employeeId,
      directives: [directive],
      evaluation: selectionResult.evaluation,
      priority,
      assignedAt: new Date().toISOString()
    };
  }
}
