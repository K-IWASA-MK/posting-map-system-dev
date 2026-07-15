import { EventEnvelope } from './EventEnvelope';
import { EventDispatchResult } from './EventDispatchResult';

export interface IEventPublisher {
  publish(envelope: EventEnvelope): Promise<EventDispatchResult>;
  publishBatch(envelopes: EventEnvelope[]): Promise<EventDispatchResult[]>;
}
