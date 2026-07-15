export enum ResourceEventType {
  CapacityChecked = "CapacityChecked",
  ReservationCreated = "ReservationCreated",
  ReservationExpired = "ReservationExpired",
  QuotaExceeded = "QuotaExceeded",
  ResourceClaimed = "ResourceClaimed",
  ResourceReleased = "ResourceReleased",
  PoolUpdated = "PoolUpdated",
  AllocationCommitted = "AllocationCommitted",
  SchedulingUpdated = "SchedulingUpdated"
}

export interface ResourceEvent {
  type: ResourceEventType;
  traceId: string;
  timestamp: number;
  payload: any;
}

export interface ResourceEventBus {
  publish(event: ResourceEvent): void;
  subscribe(type: ResourceEventType, handler: (event: ResourceEvent) => void): void;
}
