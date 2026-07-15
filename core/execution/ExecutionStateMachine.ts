import { ExecutionState } from "./ExecutionState";

export class ExecutionStateMachine {
  private currentState: ExecutionState = ExecutionState.IDLE;

  public getState(): ExecutionState {
    return this.currentState;
  }

  public transition(newState: ExecutionState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: ExecutionState, to: ExecutionState): boolean {
    const validTransitions: Record<ExecutionState, ExecutionState[]> = {
      [ExecutionState.IDLE]: [ExecutionState.CLAIMING_TICKET],
      [ExecutionState.CLAIMING_TICKET]: [ExecutionState.CREATING_SESSION, ExecutionState.FAILED],
      [ExecutionState.CREATING_SESSION]: [ExecutionState.INITIALIZING, ExecutionState.FAILED],
      [ExecutionState.INITIALIZING]: [ExecutionState.EXECUTING, ExecutionState.FAILED],
      [ExecutionState.EXECUTING]: [ExecutionState.CHECKPOINT, ExecutionState.COMPLETING, ExecutionState.TIMEOUT, ExecutionState.FAILED],
      [ExecutionState.CHECKPOINT]: [ExecutionState.EXECUTING, ExecutionState.COMPLETING, ExecutionState.FAILED],
      [ExecutionState.COMPLETING]: [ExecutionState.COMPLETED, ExecutionState.FAILED],
      [ExecutionState.TIMEOUT]: [ExecutionState.ROLLBACK],
      [ExecutionState.FAILED]: [ExecutionState.ROLLBACK, ExecutionState.ARCHIVED],
      [ExecutionState.ROLLBACK]: [ExecutionState.ARCHIVED],
      [ExecutionState.COMPLETED]: [ExecutionState.ARCHIVED],
      [ExecutionState.ARCHIVED]: [ExecutionState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
