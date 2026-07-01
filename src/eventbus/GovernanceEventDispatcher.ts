import { GovernanceEvent } from "./GovernanceEvent";

export class GovernanceEventDispatcher {
  public async dispatch(event: GovernanceEvent): Promise<boolean> {
    return true;
  }

  public async route(event: GovernanceEvent, target: Function): Promise<boolean> {
    return true;
  }

  public async resolveTarget(event: GovernanceEvent): Promise<Function[]> {
    return [];
  }
}
