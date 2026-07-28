/**
 * SupervisorDirective.ts
 * 
 * Direct instructions sent from a Supervisor to a Worker
 */

export interface SupervisorDirective {
  directiveId: string;
  supervisorId: string;
  workerId: string;
  taskId: string;
  instructions: string[];
  constraints: string[];
  createdTimestamp: string;
}
