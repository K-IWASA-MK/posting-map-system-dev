import { RuntimeEvent } from "../../orchestration/contracts/RuntimeEventContract";

export type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "SECRET";

export interface AutonomousTriggerRequest {
  readonly triggerId: string;
  readonly timestamp: number;
  readonly nonce: string;
  readonly requester: string;
  readonly signature: string;
  readonly proposalId: string;
  readonly payload?: Record<string, any>;
}

export type AutonomousEventType =
  | "AUTONOMOUS_TRIGGER_RECEIVED"
  | "AUTONOMOUS_POLICY_APPROVED"
  | "AUTONOMOUS_EXECUTION_STARTED"
  | "AUTONOMOUS_EXECUTION_BLOCKED"
  | "AUTONOMOUS_EXECUTION_COMPLETED";

export interface AutonomousEvent {
  readonly eventId: string;
  readonly eventType: AutonomousEventType;
  readonly sourceRuntime: string;
  readonly targetRuntime?: string;
  readonly timestamp: number;
  readonly payload: Record<string, any>;
  readonly schemaVersion: string;
  readonly correlationId?: string;
}

/**
 * Helper to convert AutonomousEvent to standard RuntimeEvent for orchestrator compatibility
 */
export function toRuntimeEvent(event: AutonomousEvent): RuntimeEvent {
  return {
    eventId: event.eventId,
    eventType: event.eventType as any, // Cast to RuntimeEventType for bus compatibility
    sourceRuntime: event.sourceRuntime,
    targetRuntime: event.targetRuntime,
    timestamp: event.timestamp,
    payload: event.payload,
    schemaVersion: event.schemaVersion,
    correlationId: event.correlationId
  };
}
