/**
 * ExecutionCoordinator.ts
 * 
 * Bridges Supervisor assignments with Execution Task Registry & Event Bus
 */

import { WorkerAssignment } from '../types/WorkerAssignment';
import { ExecutionTaskRegistry } from '../../../execution';

export class ExecutionCoordinator {
  public static dispatchAssignment(assignment: WorkerAssignment): void {
    const task = ExecutionTaskRegistry.get(assignment.taskId);
    if (task) {
      (task as any).assignedEmployeeId = assignment.workerId;
    }
  }
}
