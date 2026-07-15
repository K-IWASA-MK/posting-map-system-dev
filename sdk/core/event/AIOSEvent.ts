export interface AIOSEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  eventVersion: string;
  occurredAt: string;
  producerRuntimeId: string;
  correlationId: string;
  causationId: string;
  payload: T;
  metadata?: Record<string, unknown>;
}
