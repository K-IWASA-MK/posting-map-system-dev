import { EventChannel } from './EventChannel';
import { EventSource } from './EventSource';
import { EventType } from './EventType';

export interface EventEnvelope {
  readonly eventId: string;
  readonly eventType: EventType;
  readonly channel: EventChannel;
  readonly source: EventSource;
  readonly executionId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly payloadType: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly schemaVersion: string;
}
