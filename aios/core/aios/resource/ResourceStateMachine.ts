import { ResourceState } from "./ResourceState";

export class ResourceStateMachine {
  private currentState: ResourceState = ResourceState.IDLE;

  public getState(): ResourceState {
    return this.currentState;
  }

  public transition(newState: ResourceState): void {
    if (!this.isValidTransition(this.currentState, newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  private isValidTransition(from: ResourceState, to: ResourceState): boolean {
    const validTransitions: Record<ResourceState, ResourceState[]> = {
      [ResourceState.IDLE]: [ResourceState.COLLECTING_REQUIREMENTS],
      [ResourceState.COLLECTING_REQUIREMENTS]: [ResourceState.CHECKING_CAPACITY, ResourceState.FAILED],
      [ResourceState.CHECKING_CAPACITY]: [ResourceState.CREATING_RESERVATION, ResourceState.FAILED],
      [ResourceState.CREATING_RESERVATION]: [ResourceState.VALIDATING_RESERVATION, ResourceState.FAILED],
      [ResourceState.VALIDATING_RESERVATION]: [ResourceState.ALLOCATING_RESOURCES, ResourceState.FAILED, ResourceState.ARCHIVED],
      [ResourceState.ALLOCATING_RESOURCES]: [ResourceState.VALIDATING_ALLOCATION, ResourceState.FAILED],
      [ResourceState.VALIDATING_ALLOCATION]: [ResourceState.SCHEDULING, ResourceState.FAILED, ResourceState.ARCHIVED],
      [ResourceState.SCHEDULING]: [ResourceState.COMMITTING_RESOURCES, ResourceState.FAILED],
      [ResourceState.COMMITTING_RESOURCES]: [ResourceState.READY, ResourceState.FAILED],
      [ResourceState.READY]: [ResourceState.COMPLETED, ResourceState.FAILED],
      [ResourceState.COMPLETED]: [ResourceState.IDLE, ResourceState.ARCHIVED],
      [ResourceState.FAILED]: [ResourceState.ARCHIVED],
      [ResourceState.ARCHIVED]: [ResourceState.IDLE]
    };
    return validTransitions[from]?.includes(to) ?? false;
  }
}
