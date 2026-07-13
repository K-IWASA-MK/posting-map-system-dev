import { DeploymentState } from './DeploymentModels';

export class DeploymentStateMachine {
  public validateTransition(currentState: DeploymentState, nextState: DeploymentState): void {
    const validTransitions: Record<DeploymentState, DeploymentState[]> = {
      [DeploymentState.PENDING]: [DeploymentState.BUILDING, DeploymentState.CANCELLED],
      [DeploymentState.BUILDING]: [DeploymentState.TESTING, DeploymentState.PACKAGE, DeploymentState.DEPLOYING, DeploymentState.FAILED, DeploymentState.CANCELLED],
      [DeploymentState.TESTING]: [DeploymentState.PACKAGE, DeploymentState.DEPLOYING, DeploymentState.FAILED, DeploymentState.CANCELLED],
      [DeploymentState.PACKAGE]: [DeploymentState.DEPLOYING, DeploymentState.FAILED, DeploymentState.CANCELLED],
      [DeploymentState.DEPLOYING]: [DeploymentState.SUCCESS, DeploymentState.FAILED, DeploymentState.ROLLING_BACK],
      [DeploymentState.SUCCESS]: [],
      [DeploymentState.ROLLING_BACK]: [DeploymentState.FAILED, DeploymentState.CANCELLED],
      [DeploymentState.FAILED]: [],
      [DeploymentState.CANCELLED]: []
    };

    if (!validTransitions[currentState].includes(nextState)) {
      throw new Error(`Invalid transition from ${currentState} to ${nextState}`);
    }
  }
}
