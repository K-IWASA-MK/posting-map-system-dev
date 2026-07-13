import { PredictionState } from "./PredictionState";

export class PredictionStateMachine {
  private currentState: PredictionState = PredictionState.IDLE;

  public getState(): PredictionState {
    return this.currentState;
  }

  public transition(newState: PredictionState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: PredictionState, to: PredictionState): boolean {
    const validTransitions: Record<PredictionState, PredictionState[]> = {
      [PredictionState.IDLE]: [PredictionState.COLLECTING_HISTORY],
      [PredictionState.COLLECTING_HISTORY]: [PredictionState.AGGREGATING_HISTORY, PredictionState.FAILED],
      [PredictionState.AGGREGATING_HISTORY]: [PredictionState.ANALYZING_TRENDS, PredictionState.FAILED],
      [PredictionState.ANALYZING_TRENDS]: [PredictionState.GENERATING_PREDICTIONS, PredictionState.FAILED],
      [PredictionState.GENERATING_PREDICTIONS]: [PredictionState.VALIDATING_PREDICTIONS, PredictionState.FAILED],
      [PredictionState.VALIDATING_PREDICTIONS]: [PredictionState.READY, PredictionState.FAILED, PredictionState.ARCHIVED],
      [PredictionState.READY]: [PredictionState.COMPLETED, PredictionState.FAILED],
      [PredictionState.COMPLETED]: [PredictionState.IDLE],
      [PredictionState.FAILED]: [PredictionState.ARCHIVED],
      [PredictionState.ARCHIVED]: [PredictionState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
