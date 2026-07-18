export type ObservabilityEventType =
  | "RUNTIME_STARTED"
  | "RUNTIME_COMPLETED"
  | "RUNTIME_FAILED"
  | "RUNTIME_BLOCKED";

export interface ObservabilityEvent {
  readonly eventId: string;
  readonly traceId: string;
  readonly runtime: string;
  readonly eventType: ObservabilityEventType;
  readonly timestamp: number;
  readonly duration: number; // Execution duration in milliseconds
  readonly status: "SUCCESS" | "FAILED" | "BLOCKED" | "WARNING";
  readonly metadata: Record<string, any>;
  readonly schemaVersion: string;
}
