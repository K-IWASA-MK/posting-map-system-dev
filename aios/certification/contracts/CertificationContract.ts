import { RuntimeEvent } from "../../orchestration/contracts/RuntimeEventContract";

export interface CertificationRequest {
  readonly certificationId: string;
  readonly targetVersion: string;
  readonly targetGeneration: string;
  readonly auditScope: readonly string[];
  readonly timestamp: number;
}

export interface CertificationResult {
  readonly status: "CERTIFIED" | "FAILED" | "BLOCKED";
  readonly score: number;
  readonly findings: readonly string[];
  readonly generatedAt: number;
  readonly certificationHash?: string;
}

export type CertificationEventType =
  | "CERTIFICATION_STARTED"
  | "CERTIFICATION_PASSED"
  | "CERTIFICATION_FAILED"
  | "GENERATION_FROZEN";

export interface CertificationEvent {
  readonly eventId: string;
  readonly eventType: CertificationEventType;
  readonly sourceRuntime: string;
  readonly targetRuntime?: string;
  readonly timestamp: number;
  readonly payload: Record<string, any>;
  readonly schemaVersion: string;
  readonly correlationId?: string;
}

/**
 * Converted to standard RuntimeEvent for orchestrator compatibility.
 */
export function toRuntimeEvent(event: CertificationEvent): RuntimeEvent {
  return {
    eventId: event.eventId,
    eventType: event.eventType as any,
    sourceRuntime: event.sourceRuntime,
    targetRuntime: event.targetRuntime,
    timestamp: event.timestamp,
    payload: event.payload,
    schemaVersion: event.schemaVersion,
    correlationId: event.correlationId
  };
}
