export type RuntimeState = "CREATED" | "READY" | "COMPLETED" | "FAILED";

export interface RuntimeSession {
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly startedAt: string;
  readonly state: RuntimeState;
}
