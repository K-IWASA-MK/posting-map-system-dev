import { SchedulingState } from "./SchedulingState";

export class SchedulingStateMachine {
  private currentState: SchedulingState = SchedulingState.IDLE;

  public getState(): SchedulingState {
    return this.currentState;
  }

  public transition(newState: SchedulingState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: SchedulingState, to: SchedulingState): boolean {
    const validTransitions: Record<SchedulingState, SchedulingState[]> = {
      [SchedulingState.IDLE]: [SchedulingState.ENQUEUING],
      [SchedulingState.ENQUEUING]: [SchedulingState.RESOLVING_DEPENDENCIES, SchedulingState.FAILED],
      [SchedulingState.RESOLVING_DEPENDENCIES]: [SchedulingState.CHECKING_CONSTRAINTS, SchedulingState.FAILED],
      [SchedulingState.CHECKING_CONSTRAINTS]: [SchedulingState.PRIORITIZING, SchedulingState.FAILED],
      [SchedulingState.PRIORITIZING]: [SchedulingState.ALLOCATING_TICKET, SchedulingState.FAILED],
      [SchedulingState.ALLOCATING_TICKET]: [SchedulingState.DISPATCHING, SchedulingState.FAILED],
      [SchedulingState.DISPATCHING]: [SchedulingState.WAITING_EXECUTION, SchedulingState.FAILED],
      [SchedulingState.WAITING_EXECUTION]: [SchedulingState.COMPLETED, SchedulingState.PREEMPTED, SchedulingState.FAILED],
      [SchedulingState.PREEMPTED]: [SchedulingState.PRIORITIZING, SchedulingState.FAILED],
      [SchedulingState.COMPLETED]: [SchedulingState.IDLE, SchedulingState.ARCHIVED],
      [SchedulingState.FAILED]: [SchedulingState.ARCHIVED],
      [SchedulingState.ARCHIVED]: [SchedulingState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
