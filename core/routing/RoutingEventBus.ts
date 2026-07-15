export enum RoutingEventType {
  RoutingRequested = "RoutingRequested",
  ContextEvaluated = "ContextEvaluated",
  PathDetermined = "PathDetermined",
  PathValidated = "PathValidated",
  RoutingApproved = "RoutingApproved",
  RoutingRejected = "RoutingRejected",
  RoutingCompleted = "RoutingCompleted",
  RoutingArchived = "RoutingArchived"
}

export interface RoutingEvent {
  type: RoutingEventType;
  traceId: string;
  timestamp: number;
  payload: any;
}

export interface RoutingEventBus {
  publish(event: RoutingEvent): void;
  subscribe(type: RoutingEventType, handler: (event: RoutingEvent) => void): void;
}
