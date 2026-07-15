import { EventChannel } from './EventChannel';
import { EventType } from './EventType';
import { EventEnvelope } from './EventEnvelope';

export interface IEventSubscriber {
  supportsChannel(channel: EventChannel): boolean;
  supportsEventType(eventType: EventType): boolean;
  onEvent(envelope: EventEnvelope): Promise<void>;
  priority(): number; // Larger numbers = higher priority
}
