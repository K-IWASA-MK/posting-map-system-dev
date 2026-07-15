import { PolicyState } from "./PolicyState";

export class PolicyStateMachine {
  private currentState: PolicyState = PolicyState.IDLE;

  public getState(): PolicyState {
    return this.currentState;
  }

  public transition(newState: PolicyState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: PolicyState, to: PolicyState): boolean {
    const validTransitions: Record<PolicyState, PolicyState[]> = {
      [PolicyState.IDLE]: [PolicyState.COLLECTING_CONTEXT],
      [PolicyState.COLLECTING_CONTEXT]: [PolicyState.EVALUATING_RULES, PolicyState.FAILED],
      [PolicyState.EVALUATING_RULES]: [PolicyState.RESOLVING_CONFLICTS, PolicyState.FAILED],
      [PolicyState.RESOLVING_CONFLICTS]: [PolicyState.GENERATING_POLICY, PolicyState.FAILED],
      [PolicyState.GENERATING_POLICY]: [PolicyState.VALIDATING_POLICY, PolicyState.FAILED],
      [PolicyState.VALIDATING_POLICY]: [PolicyState.APPROVING_POLICY, PolicyState.FAILED, PolicyState.ARCHIVED],
      [PolicyState.APPROVING_POLICY]: [PolicyState.READY, PolicyState.FAILED, PolicyState.ARCHIVED],
      [PolicyState.READY]: [PolicyState.ACTIVATING_POLICY, PolicyState.FAILED],
      [PolicyState.ACTIVATING_POLICY]: [PolicyState.COMPLETED, PolicyState.FAILED],
      [PolicyState.COMPLETED]: [PolicyState.IDLE, PolicyState.ARCHIVED],
      [PolicyState.FAILED]: [PolicyState.ARCHIVED],
      [PolicyState.ARCHIVED]: [PolicyState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
