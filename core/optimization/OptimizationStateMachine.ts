import { OptimizationState } from "./OptimizationState";

export class OptimizationStateMachine {
  private currentState: OptimizationState = OptimizationState.IDLE;

  public getState(): OptimizationState {
    return this.currentState;
  }

  public transition(newState: OptimizationState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: OptimizationState, to: OptimizationState): boolean {
    const validTransitions: Record<OptimizationState, OptimizationState[]> = {
      [OptimizationState.IDLE]: [OptimizationState.SENSING],
      [OptimizationState.SENSING]: [OptimizationState.ANALYZING, OptimizationState.FAILED],
      [OptimizationState.ANALYZING]: [OptimizationState.EVALUATING, OptimizationState.FAILED],
      [OptimizationState.EVALUATING]: [OptimizationState.SIMULATING, OptimizationState.READY, OptimizationState.FAILED],
      [OptimizationState.SIMULATING]: [OptimizationState.DECIDING, OptimizationState.FAILED],
      [OptimizationState.DECIDING]: [OptimizationState.READY, OptimizationState.FAILED],
      [OptimizationState.READY]: [OptimizationState.COMPLETED, OptimizationState.FAILED, OptimizationState.ARCHIVED],
      [OptimizationState.COMPLETED]: [OptimizationState.IDLE],
      [OptimizationState.FAILED]: [OptimizationState.ARCHIVED],
      [OptimizationState.ARCHIVED]: [OptimizationState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
