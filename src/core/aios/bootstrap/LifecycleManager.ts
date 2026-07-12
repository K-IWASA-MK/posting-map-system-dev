export enum AIOSState {
  BOOTING = 'BOOTING',
  READY = 'READY',
  RUNNING = 'RUNNING',
  IDLE = 'IDLE',
  SHUTDOWN = 'SHUTDOWN',
  ERROR = 'ERROR'
}

export class LifecycleManager {
  private state: AIOSState = AIOSState.BOOTING;

  public getState(): AIOSState {
    return this.state;
  }

  public transitionTo(newState: AIOSState): void {
    const validTransitions: Record<AIOSState, AIOSState[]> = {
      [AIOSState.BOOTING]: [AIOSState.READY, AIOSState.ERROR],
      [AIOSState.READY]: [AIOSState.RUNNING, AIOSState.IDLE, AIOSState.SHUTDOWN],
      [AIOSState.RUNNING]: [AIOSState.IDLE, AIOSState.READY, AIOSState.ERROR],
      [AIOSState.IDLE]: [AIOSState.RUNNING, AIOSState.SHUTDOWN],
      [AIOSState.SHUTDOWN]: [],
      [AIOSState.ERROR]: [AIOSState.SHUTDOWN, AIOSState.BOOTING, AIOSState.READY]
    };

    if (!validTransitions[this.state].includes(newState)) {
      throw new Error(`Invalid AIOS state transition from ${this.state} to ${newState}`);
    }

    this.state = newState;
  }
}
