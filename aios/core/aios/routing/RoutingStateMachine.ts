import { RoutingState } from "./RoutingState";

export class RoutingStateMachine {
  private currentState: RoutingState = RoutingState.IDLE;

  public getState(): RoutingState {
    return this.currentState;
  }

  public transition(newState: RoutingState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: RoutingState, to: RoutingState): boolean {
    const validTransitions: Record<RoutingState, RoutingState[]> = {
      [RoutingState.IDLE]: [RoutingState.SENSING],
      [RoutingState.SENSING]: [RoutingState.EVALUATING_CONTEXT, RoutingState.FAILED],
      [RoutingState.EVALUATING_CONTEXT]: [RoutingState.DETERMINING_PATH, RoutingState.FAILED],
      [RoutingState.DETERMINING_PATH]: [RoutingState.VALIDATING_PATH, RoutingState.FAILED],
      [RoutingState.VALIDATING_PATH]: [RoutingState.READY, RoutingState.FAILED],
      [RoutingState.READY]: [RoutingState.ROUTING, RoutingState.FAILED, RoutingState.ARCHIVED],
      [RoutingState.ROUTING]: [RoutingState.COMPLETED, RoutingState.FAILED],
      [RoutingState.COMPLETED]: [RoutingState.IDLE],
      [RoutingState.FAILED]: [RoutingState.ARCHIVED],
      [RoutingState.ARCHIVED]: [RoutingState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
