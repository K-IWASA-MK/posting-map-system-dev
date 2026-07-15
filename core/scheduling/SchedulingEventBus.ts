export enum SchedulingEventType {
  TaskEnqueued = "TaskEnqueued",
  DependenciesResolved = "DependenciesResolved",
  ConstraintsChecked = "ConstraintsChecked",
  TaskPrioritized = "TaskPrioritized",
  TicketAllocated = "TicketAllocated",
  TaskDispatched = "TaskDispatched",
  TaskPreempted = "TaskPreempted",
  DeadlineMissed = "DeadlineMissed"
}

export interface SchedulingEvent {
  type: SchedulingEventType;
  traceId: string;
  timestamp: number;
  payload: any;
}

export interface SchedulingEventBus {
  publish(event: SchedulingEvent): void;
  subscribe(type: SchedulingEventType, handler: (event: SchedulingEvent) => void): void;
}
