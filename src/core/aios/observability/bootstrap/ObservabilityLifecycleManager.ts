export enum ObservabilityLifecycleState {
  IDLE = 'IDLE',
  BOOTING = 'BOOTING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  SHUTDOWN = 'SHUTDOWN',
  ERROR = 'ERROR',
}

export class ObservabilityLifecycleManager {
  private currentState: ObservabilityLifecycleState = ObservabilityLifecycleState.IDLE;

  public transitionTo(state: ObservabilityLifecycleState): void {
    // Basic lifecycle state machine validation (e.g. READY cannot go back to BOOTING directly)
    if (this.currentState === ObservabilityLifecycleState.SHUTDOWN && state !== ObservabilityLifecycleState.IDLE) {
      throw new Error(`Invalid lifecycle transition from SHUTDOWN to ${state}`);
    }
    this.currentState = state;
  }

  public getState(): ObservabilityLifecycleState {
    return this.currentState;
  }
}
