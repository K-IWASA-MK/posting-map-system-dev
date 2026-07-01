import { GovernanceEvent } from "./GovernanceEvent";
import { GovernanceEventType } from "./GovernanceEventType";

export interface IGovernanceEventBusEngine {
  publish(event: GovernanceEvent): Promise<boolean>;
  subscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  unsubscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  emit(event: GovernanceEvent): Promise<boolean>;
}

export abstract class BaseGovernanceEventBusEngine implements IGovernanceEventBusEngine {
  abstract publish(event: GovernanceEvent): Promise<boolean>;
  abstract subscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  abstract unsubscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  abstract emit(event: GovernanceEvent): Promise<boolean>;
}
