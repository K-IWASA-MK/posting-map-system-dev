import { ResourceReservation } from "./ResourceReservation";
import { ResourceQuota } from "./ResourceQuota";
import { ResourcePool } from "./ResourcePool";
import { ResourceAllocation } from "./ResourceAllocation";

export interface ReservationLedger {
  appendReservation(reservation: ResourceReservation): void;
}

export interface QuotaLedger {
  appendQuotaChange(quota: ResourceQuota): void;
}

export interface PoolLedger {
  appendPoolChange(pool: ResourcePool): void;
}

export interface AllocationLedger {
  appendAllocation(allocation: ResourceAllocation): void;
}

export interface SchedulingLedger {
  appendSchedulingEvent(allocationId: string, event: string): void;
}

export interface AuditLedger {
  appendAudit(tag: string, traceId: string, payload: any): void;
}
