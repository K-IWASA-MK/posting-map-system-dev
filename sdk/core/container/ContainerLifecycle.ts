export enum ContainerLifecycleState {
  CREATED = 'CREATED',
  PREPARING = 'PREPARING',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  TERMINATED = 'TERMINATED'
}

export class ContainerLifecycle {
  private currentState: ContainerLifecycleState = ContainerLifecycleState.CREATED;
  private history: { state: ContainerLifecycleState; timestamp: string }[] = [];

  constructor() {
    this.transitionTo(ContainerLifecycleState.CREATED);
  }

  public getState(): ContainerLifecycleState {
    return this.currentState;
  }

  public transitionTo(state: ContainerLifecycleState): void {
    // Basic state transition validation can go here
    this.currentState = state;
    this.history.push({
      state,
      timestamp: new Date().toISOString()
    });
  }

  public getHistory() {
    return this.history;
  }
}
