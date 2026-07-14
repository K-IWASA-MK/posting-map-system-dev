import { ScheduleTicket } from "./ScheduleTicket";
import { DispatchDecision } from "./DispatchDecision";

export interface SchedulingRecord {
  readonly id: string;
  readonly traceId: string;
  readonly ticket: ScheduleTicket;
  readonly decision: DispatchDecision;
  readonly scheduledAt: number;
}
