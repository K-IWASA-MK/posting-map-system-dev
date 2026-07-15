export enum CoordinationEventType {
  CoordinationRequested = "CoordinationRequested",
  RuntimesQueried = "RuntimesQueried",
  ConsensusStarted = "ConsensusStarted",
  ConsensusCompleted = "ConsensusCompleted",
  RuntimeUnavailable = "RuntimeUnavailable",
  DecisionGenerated = "DecisionGenerated",
  DecisionValidated = "DecisionValidated",
  DecisionRejected = "DecisionRejected",
  DelegationStarted = "DelegationStarted",
  DelegationCompleted = "DelegationCompleted"
}

export interface CoordinationEvent {
  type: CoordinationEventType;
  traceId: string;
  timestamp: number;
  payload: any;
}

export interface CoordinationEventBus {
  publish(event: CoordinationEvent): void;
  subscribe(type: CoordinationEventType, handler: (event: CoordinationEvent) => void): void;
}
