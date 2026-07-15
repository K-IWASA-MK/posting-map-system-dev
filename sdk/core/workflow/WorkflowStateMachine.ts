import { WorkflowState } from './WorkflowModels';

export class WorkflowStateMachine {
  private currentState: WorkflowState = WorkflowState.PENDING;

  public canTransitionTo(newState: WorkflowState): boolean {
    switch (this.currentState) {
      case WorkflowState.PENDING:
        return newState === WorkflowState.RUNNING || newState === WorkflowState.CANCELLED;
      case WorkflowState.RUNNING:
        return [WorkflowState.PAUSED, WorkflowState.COMPLETED, WorkflowState.FAILED, WorkflowState.CANCELLED].includes(newState);
      case WorkflowState.PAUSED:
        return [WorkflowState.RUNNING, WorkflowState.CANCELLED].includes(newState);
      case WorkflowState.COMPLETED:
      case WorkflowState.FAILED:
      case WorkflowState.CANCELLED:
        return false; // Terminal states
      default:
        return false;
    }
  }

  public transitionTo(newState: WorkflowState): void {
    if (!this.canTransitionTo(newState)) {
      throw new Error(`Invalid workflow state transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  public getState(): WorkflowState {
    return this.currentState;
  }
}
