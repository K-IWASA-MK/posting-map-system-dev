import { SchedulingRecord } from "./SchedulingRecord";
import { DispatchDecision } from "./DispatchDecision";
import { ScheduleTicket } from "./ScheduleTicket";

export interface QueueLedger {
  appendEnqueue(traceId: string, timestamp: number): void;
}

export interface PriorityLedger {
  appendPrioritization(traceId: string, score: number): void;
}

export interface DependencyLedger {
  appendResolution(traceId: string, resolvedDeps: string[]): void;
}

export interface DispatchLedger {
  appendDispatch(decision: DispatchDecision): void;
}

export interface TicketLedger {
  appendTicket(ticket: ScheduleTicket): void;
}

export interface DeadlineLedger {
  appendMissedDeadline(traceId: string): void;
}

export interface PreemptionLedger {
  appendPreemption(traceId: string, preemptedBy: string): void;
}

export interface HistoryLedger {
  appendHistory(record: SchedulingRecord): void;
}

export interface AuditLedger {
  appendAudit(tag: string, traceId: string, payload: any): void;
}
