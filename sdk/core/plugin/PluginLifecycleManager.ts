import { DevelopmentPluginStatus } from './DevelopmentPluginStatus';

export class PluginLifecycleManager {
  private static readonly ALLOWED_TRANSITIONS: Record<DevelopmentPluginStatus, DevelopmentPluginStatus[]> = {
    [DevelopmentPluginStatus.UNLOADED]: [
      DevelopmentPluginStatus.DISCOVERED,
      DevelopmentPluginStatus.FAILED,
    ],
    [DevelopmentPluginStatus.DISCOVERED]: [
      DevelopmentPluginStatus.LOADED,
      DevelopmentPluginStatus.FAILED,
      DevelopmentPluginStatus.DISPOSED,
    ],
    [DevelopmentPluginStatus.LOADED]: [
      DevelopmentPluginStatus.INITIALIZED,
      DevelopmentPluginStatus.FAILED,
      DevelopmentPluginStatus.DISPOSED,
    ],
    [DevelopmentPluginStatus.INITIALIZED]: [
      DevelopmentPluginStatus.READY,
      DevelopmentPluginStatus.FAILED,
      DevelopmentPluginStatus.DISPOSED,
    ],
    [DevelopmentPluginStatus.READY]: [
      DevelopmentPluginStatus.RUNNING,
      DevelopmentPluginStatus.FAILED,
      DevelopmentPluginStatus.DISPOSED,
    ],
    [DevelopmentPluginStatus.RUNNING]: [
      DevelopmentPluginStatus.COMPLETED,
      DevelopmentPluginStatus.FAILED,
    ],
    [DevelopmentPluginStatus.COMPLETED]: [
      DevelopmentPluginStatus.DISPOSED,
    ],
    [DevelopmentPluginStatus.FAILED]: [
      DevelopmentPluginStatus.DISPOSED,
    ],
    [DevelopmentPluginStatus.DISPOSED]: [], // Terminal state
  };

  /**
   * Validates if a transition from currentState to nextState is allowed.
   * Throws an error if the transition is invalid.
   */
  public static validateTransition(currentState: DevelopmentPluginStatus, nextState: DevelopmentPluginStatus): void {
    if (currentState === nextState) {
      // Transitioning to the exact same state is generally not an error, but could be ignored.
      // We will allow it but in practice the system should avoid redundant calls.
      return;
    }

    const allowedNextStates = this.ALLOWED_TRANSITIONS[currentState] || [];
    if (!allowedNextStates.includes(nextState)) {
      throw new Error(
        `Invalid plugin lifecycle transition: Cannot transition from ${currentState} to ${nextState}.`
      );
    }
  }

  /**
   * Check if transition is allowed without throwing an error
   */
  public static canTransition(currentState: DevelopmentPluginStatus, nextState: DevelopmentPluginStatus): boolean {
    if (currentState === nextState) return true;
    const allowedNextStates = this.ALLOWED_TRANSITIONS[currentState] || [];
    return allowedNextStates.includes(nextState);
  }
}
