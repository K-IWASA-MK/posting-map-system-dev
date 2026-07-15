export enum ExecutionEventType {
  ExecutionStarted = "ExecutionStarted",
  ExecutionFinished = "ExecutionFinished",
  ExecutionFailed = "ExecutionFailed",
  RollbackStarted = "RollbackStarted",
  RollbackFinished = "RollbackFinished",
  TicketClaimed = "TicketClaimed"
}

export interface ExecutionEvent {
  type: ExecutionEventType;
  sessionId: string;
  timestamp: number;
  payload: any;
}

export interface ExecutionEventBus {
  publish(event: ExecutionEvent): void;
  subscribe(type: ExecutionEventType, handler: (event: ExecutionEvent) => void): void;
}
