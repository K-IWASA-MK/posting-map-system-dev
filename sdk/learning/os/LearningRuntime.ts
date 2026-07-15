import { LearningOSState } from './LearningOSState';

export class LearningRuntime {
  private currentState: LearningOSState = LearningOSState.BOOTING;
  private readonly startTimeMs: number;
  private _lastError?: string;

  constructor() {
    this.startTimeMs = Date.now();
  }

  public get state(): LearningOSState {
    return this.currentState;
  }

  public get uptimeMs(): number {
    return Date.now() - this.startTimeMs;
  }

  public get lastError(): string | undefined {
    return this._lastError;
  }

  public transitionTo(newState: LearningOSState, errorMessage?: string): void {
    if (this.currentState === LearningOSState.ERROR) {
      throw new Error(`Cannot transition from ERROR to ${newState}`);
    }

    if (this.currentState === LearningOSState.SHUTDOWN) {
      throw new Error(`Cannot transition from SHUTDOWN to ${newState}`);
    }

    this.currentState = newState;
    if (newState === LearningOSState.ERROR && errorMessage) {
      this._lastError = errorMessage;
    }
  }

  public assertReady(): void {
    if (this.currentState !== LearningOSState.READY) {
      throw new Error(`Learning OS is not READY. Current state: ${this.currentState}`);
    }
  }

  public async runSafely<T>(operation: () => Promise<T>): Promise<T> {
    this.assertReady();
    this.transitionTo(LearningOSState.RUNNING);
    try {
      const result = await operation();
      this.transitionTo(LearningOSState.READY);
      return result;
    } catch (err: any) {
      this.transitionTo(LearningOSState.READY); // Return to ready if pipeline fails, or ERROR if it's fatal? Pipeline failures should not kill OS.
      throw err;
    }
  }
}
