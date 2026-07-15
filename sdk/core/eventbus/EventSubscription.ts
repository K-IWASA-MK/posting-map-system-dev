import { IEventSubscriber } from './IEventSubscriber';

export interface EventSubscription {
  readonly subscriptionId: string;
  readonly subscriberName: string;
  readonly subscriber: IEventSubscriber;
}
