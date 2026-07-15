import { SessionState } from "./SessionState";

export interface ExecutionSession {
  readonly sessionId: string;
  readonly ticketId: string;
  readonly runtimeId: string;
  readonly startedAt: number;
  readonly endedAt?: number;
  readonly status: SessionState;
}
