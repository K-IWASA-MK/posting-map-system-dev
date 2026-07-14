export enum PolicyEventType {
  PolicyEvaluationRequested = "PolicyEvaluationRequested",
  RulesEvaluated = "RulesEvaluated",
  PolicyUpdateGenerated = "PolicyUpdateGenerated",
  PolicyApplied = "PolicyApplied",
  PolicyConflictDetected = "PolicyConflictDetected",
  PolicyRecommendationGenerated = "PolicyRecommendationGenerated",
  PolicyActivated = "PolicyActivated",
  PolicyDeprecated = "PolicyDeprecated",
  PolicyRolledBack = "PolicyRolledBack",
  PolicyScopeChanged = "PolicyScopeChanged",
  PolicyVersionCreated = "PolicyVersionCreated"
}

export interface PolicyEvent {
  type: PolicyEventType;
  traceId: string;
  timestamp: number;
  payload: any;
}

export interface PolicyEventBus {
  publish(event: PolicyEvent): void;
  subscribe(type: PolicyEventType, handler: (event: PolicyEvent) => void): void;
}
