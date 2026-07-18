export type RuntimeEventType =
  | "EXECUTION_COMPLETED"
  | "VALIDATION_COMPLETED"
  | "AUDIT_RECORDED"
  | "LEARNING_UPDATED"
  | "COMPLETION_COMPLETED";

export interface RuntimeEvent {
  readonly eventId: string;
  readonly eventType: RuntimeEventType;
  readonly sourceRuntime: string;
  readonly targetRuntime?: string;
  readonly timestamp: number;
  readonly payload: Record<string, any>;
  readonly schemaVersion: string;
  readonly correlationId?: string; // Optional field for cross-sprint context correlation
}
