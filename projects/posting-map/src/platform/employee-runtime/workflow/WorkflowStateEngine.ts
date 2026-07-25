/**
 * AIOS Employee Workflow Orchestration Foundation
 * Deterministic Workflow State Engine Implementation
 */

import { IWorkflowStateEngine } from './contract/IEmployeeWorkflow';
import { WorkflowStatus } from './models/EmployeeWorkflowModels';

export class WorkflowStateEngine implements IWorkflowStateEngine {
  private allowedTransitions: Record<WorkflowStatus, WorkflowStatus[]> = {
    CREATED: ['ACTIVE', 'CANCELLED'],
    ACTIVE: ['RUNNING', 'PAUSED', 'CANCELLED'],
    RUNNING: ['COMPLETED', 'PAUSED', 'FAILED', 'CANCELLED'],
    PAUSED: ['RUNNING', 'FAILED', 'CANCELLED'],
    COMPLETED: [],
    FAILED: [],
    CANCELLED: [],
  };

  public transitionState(
    currentStatus: WorkflowStatus,
    targetStatus: WorkflowStatus
  ): WorkflowStatus {
    const validTargets = this.allowedTransitions[currentStatus] || [];

    if (!validTargets.includes(targetStatus)) {
      throw new Error(
        `[Workflow State Engine Block] Invalid state transition from '${currentStatus}' to '${targetStatus}'.`
      );
    }

    return targetStatus;
  }
}
