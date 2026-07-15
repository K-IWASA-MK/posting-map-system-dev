import { CoordinationState } from "./CoordinationState";

export class CoordinationStateMachine {
  private currentState: CoordinationState = CoordinationState.IDLE;

  public getState(): CoordinationState {
    return this.currentState;
  }

  public transition(newState: CoordinationState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: CoordinationState, to: CoordinationState): boolean {
    const validTransitions: Record<CoordinationState, CoordinationState[]> = {
      [CoordinationState.IDLE]: [CoordinationState.COLLECTING_CONTEXT],
      [CoordinationState.COLLECTING_CONTEXT]: [CoordinationState.QUERYING_RUNTIMES, CoordinationState.FAILED],
      [CoordinationState.QUERYING_RUNTIMES]: [CoordinationState.CONSENSUS, CoordinationState.FAILED],
      [CoordinationState.CONSENSUS]: [CoordinationState.GENERATING_PLAN, CoordinationState.FAILED],
      [CoordinationState.GENERATING_PLAN]: [CoordinationState.VALIDATING_PLAN, CoordinationState.FAILED],
      [CoordinationState.VALIDATING_PLAN]: [CoordinationState.GENERATING_DECISION, CoordinationState.FAILED, CoordinationState.ARCHIVED],
      [CoordinationState.GENERATING_DECISION]: [CoordinationState.VALIDATING_DECISION, CoordinationState.FAILED],
      [CoordinationState.VALIDATING_DECISION]: [CoordinationState.GENERATING_DELEGATION, CoordinationState.FAILED, CoordinationState.ARCHIVED],
      [CoordinationState.GENERATING_DELEGATION]: [CoordinationState.DELEGATING_EXECUTION, CoordinationState.FAILED],
      [CoordinationState.DELEGATING_EXECUTION]: [CoordinationState.COMPLETED, CoordinationState.FAILED],
      [CoordinationState.COMPLETED]: [CoordinationState.IDLE, CoordinationState.ARCHIVED],
      [CoordinationState.FAILED]: [CoordinationState.ARCHIVED],
      [CoordinationState.ARCHIVED]: [CoordinationState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
