import { EvolutionState } from '../models/EvolutionEnums';

export class EvolutionStateMachine {
  private currentState: EvolutionState;

  constructor(initialState: EvolutionState = EvolutionState.CREATED) {
    this.currentState = initialState;
  }

  public getState(): EvolutionState {
    return this.currentState;
  }

  public transitionTo(newState: EvolutionState): void {
    if (this.canTransition(newState)) {
      this.currentState = newState;
    } else {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
  }

  private canTransition(newState: EvolutionState): boolean {
    switch (this.currentState) {
      case EvolutionState.CREATED:
        return newState === EvolutionState.ANALYZING || newState === EvolutionState.REJECTED;
      case EvolutionState.ANALYZING:
        return newState === EvolutionState.PLANNING || newState === EvolutionState.REJECTED;
      case EvolutionState.PLANNING:
        return newState === EvolutionState.SIMULATING || newState === EvolutionState.REJECTED;
      case EvolutionState.SIMULATING:
        return newState === EvolutionState.READY || newState === EvolutionState.REJECTED;
      case EvolutionState.READY:
        return newState === EvolutionState.APPROVAL || newState === EvolutionState.REJECTED;
      case EvolutionState.APPROVAL:
        return newState === EvolutionState.APPROVED || newState === EvolutionState.REJECTED;
      case EvolutionState.APPROVED:
        return newState === EvolutionState.EVOLVING || newState === EvolutionState.REJECTED;
      case EvolutionState.EVOLVING:
        return newState === EvolutionState.EVOLVED || newState === EvolutionState.REJECTED;
      case EvolutionState.EVOLVED:
        return newState === EvolutionState.ARCHIVED;
      case EvolutionState.REJECTED:
        return newState === EvolutionState.ARCHIVED;
      case EvolutionState.ARCHIVED:
        return false;
      default:
        return false;
    }
  }
}
