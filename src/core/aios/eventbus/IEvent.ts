import { EventType } from './EventType';
import { EventChannel } from './EventChannel';
import { EventSource } from './EventSource';

export interface IEvent {
  readonly eventType: EventType;
  readonly channel: EventChannel;
  readonly source: EventSource;
  readonly payloadType: string;
  readonly payload: Readonly<Record<string, unknown>>;
}
