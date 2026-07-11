import { GovernanceEventType } from "./GovernanceEventType";
import { GovernanceEventPriority } from "./GovernanceEventPriority";
import { GovernanceEventContext } from "./GovernanceEventContext";

export interface GovernanceEvent {
  id: string;
  type: GovernanceEventType;
  source: string;
  payload: Record<string, any>;
  timestamp: Date;
  priority: GovernanceEventPriority;
  context: GovernanceEventContext;
}
