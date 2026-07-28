/**
 * WorkerAssignment.ts
 * 
 * Formal Worker Assignment Payload issued by a Supervisor
 */

import { SupervisorDirective } from './SupervisorDirective';
import { AssignmentEvaluation } from './AssignmentEvaluation';

export enum AssignmentPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  STANDARD = 'STANDARD',
  BACKGROUND = 'BACKGROUND'
}

export interface WorkerAssignment {
  assignmentId: string;
  taskId: string;
  supervisorId: string;
  workerId: string;
  directives: SupervisorDirective[];
  evaluation: AssignmentEvaluation;
  priority: AssignmentPriority;
  assignedAt: string;
}
