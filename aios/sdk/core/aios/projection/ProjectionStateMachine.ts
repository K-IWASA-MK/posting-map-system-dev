import { ProjectionState } from './ProjectionState';

export class ProjectionStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<ProjectionState, ProjectionState[]> = {
    [ProjectionState.BOOTING]: [ProjectionState.READY, ProjectionState.ERROR],
    [ProjectionState.READY]: [ProjectionState.RUNNING, ProjectionState.ERROR],
    [ProjectionState.RUNNING]: [ProjectionState.COMPLETED, ProjectionState.ERROR],
    [ProjectionState.COMPLETED]: [],
    [ProjectionState.ERROR]: []
  };

  public static isValidTransition(current: ProjectionState, next: ProjectionState): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[current];
    return allowed ? allowed.includes(next) : false;
  }
}
