/**
 * ProjectLifecycle manages lifecycle status transitions using a state machine pattern.
 * Strictly enforces forward transitions: development -> production -> archived.
 */
export class ProjectLifecycle {
  private static readonly ALLOWED_TRANSITIONS: Record<string, string[]> = {
    'development': ['production'],
    'production': ['archived'],
    'archived': []
  };

  /**
   * Checks if a transition from currentStatus to targetStatus is permitted.
   * @param currentStatus Current state of the project.
   * @param targetStatus Proposed target state.
   */
  public static isTransitionAllowed(
    currentStatus: 'development' | 'production' | 'archived',
    targetStatus: 'development' | 'production' | 'archived'
  ): boolean {
    if (currentStatus === targetStatus) {
      return true; // Staying in the same status is always allowed
    }

    const allowedTargets = this.ALLOWED_TRANSITIONS[currentStatus];
    return allowedTargets ? allowedTargets.includes(targetStatus) : false;
  }
}
