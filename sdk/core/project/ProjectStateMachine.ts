import { ProjectEntityState } from './ProjectModels';

export class ProjectStateMachine {
  public validateTransition(currentState: ProjectEntityState, nextState: ProjectEntityState): void {
    const validTransitions: Record<ProjectEntityState, ProjectEntityState[]> = {
      [ProjectEntityState.NEW]: [ProjectEntityState.ACTIVE, ProjectEntityState.CANCELLED],
      [ProjectEntityState.ACTIVE]: [ProjectEntityState.COMPLETED, ProjectEntityState.CANCELLED],
      [ProjectEntityState.COMPLETED]: [],
      [ProjectEntityState.CANCELLED]: []
    };

    if (!validTransitions[currentState].includes(nextState)) {
      throw new Error(`Invalid transition from ${currentState} to ${nextState}`);
    }
  }
}
