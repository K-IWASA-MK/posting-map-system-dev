import { RuntimeState } from './RuntimeState';

export class RuntimeStateMachine {
  private currentState: RuntimeState = RuntimeState.CREATED;

  public async transition(newState: RuntimeState, error?: Error): Promise<RuntimeState> {
    if (newState === RuntimeState.FAILED) {
      this.currentState = RuntimeState.FAILED;
      return this.currentState;
    }

    const validTransitions: Record<RuntimeState, RuntimeState[]> = {
      [RuntimeState.CREATED]: [RuntimeState.REGISTERED, RuntimeState.INITIALIZING, RuntimeState.FAILED],
      [RuntimeState.REGISTERED]: [RuntimeState.INITIALIZING, RuntimeState.FAILED],
      [RuntimeState.INITIALIZING]: [RuntimeState.READY, RuntimeState.FAILED],
      [RuntimeState.READY]: [RuntimeState.RUNNING, RuntimeState.STOPPING, RuntimeState.FAILED],
      [RuntimeState.RUNNING]: [RuntimeState.PAUSED, RuntimeState.STOPPING, RuntimeState.READY, RuntimeState.FAILED],
      [RuntimeState.PAUSED]: [RuntimeState.RUNNING, RuntimeState.STOPPING, RuntimeState.FAILED],
      [RuntimeState.STOPPING]: [RuntimeState.STOPPED, RuntimeState.FAILED],
      [RuntimeState.STOPPED]: [],
      [RuntimeState.FAILED]: [RuntimeState.STOPPING]
    };

    if (!validTransitions[this.currentState].includes(newState)) {
      throw new Error(`Invalid runtime state transition from ${this.currentState} to ${newState}`);
    }

    this.currentState = newState;
    return this.currentState;
  }

  public getState(): RuntimeState {
    return this.currentState;
  }
}
