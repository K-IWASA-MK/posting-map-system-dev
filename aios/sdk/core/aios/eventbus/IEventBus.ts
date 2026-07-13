import { EventEnvelope } from './EventEnvelope';
import { IEventSubscriber } from './IEventSubscriber';
import { EventSubscription } from './EventSubscription';
import { EventDispatchResult } from './EventDispatchResult';

export interface IEventBus {
  publish(envelope: EventEnvelope): Promise<EventDispatchResult>;
  subscribe(subscription: EventSubscription): void;
  unsubscribe(subscriptionId: string): void;
}
