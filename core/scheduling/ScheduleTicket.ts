import { TicketState } from "./TicketState";
import { ExecutionWindow } from "./ExecutionWindow";
import { RetryPolicy } from "./RetryPolicy";
import { TaskAffinity } from "./TaskAffinity";

export interface ScheduleTicket {
  readonly ticketId: string;
  readonly traceId: string;
  readonly state: TicketState;
  readonly window: ExecutionWindow;
  readonly affinity: TaskAffinity;
  readonly retryPolicy: RetryPolicy;
  readonly issuedAt: number;
}
