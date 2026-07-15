import { EventSubscription } from './EventSubscription';
import { EventEnvelope } from './EventEnvelope';

export class SubscriberRegistry {
  private subscriptions: Map<string, EventSubscription> = new Map();

  public register(subscription: EventSubscription): void {
    if (this.subscriptions.has(subscription.subscriptionId)) {
      throw new Error(`Subscription with ID ${subscription.subscriptionId} already registered.`);
    }
    this.subscriptions.set(subscription.subscriptionId, subscription);
  }

  public deregister(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  public findSubscribersFor(envelope: EventEnvelope): EventSubscription[] {
    const matched: EventSubscription[] = [];
    for (const sub of this.subscriptions.values()) {
      const s = sub.subscriber;
      if (s.supportsChannel(envelope.channel) && s.supportsEventType(envelope.eventType)) {
        matched.push(sub);
      }
    }
    return matched;
  }

  public getAll(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }
}
