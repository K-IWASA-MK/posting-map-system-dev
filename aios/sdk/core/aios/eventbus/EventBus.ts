import { IEventBus } from './IEventBus';
import { EventEnvelope } from './EventEnvelope';
import { EventSubscription } from './EventSubscription';
import { EventDispatchResult } from './EventDispatchResult';
import { EventBusConfiguration, DispatchMode, ExceptionPolicy } from './EventBusConfiguration';
import { SubscriberRegistry } from './SubscriberRegistry';
import { EventDispatcher } from './EventDispatcher';

export class EventBus implements IEventBus {
  private registry: SubscriberRegistry;
  private dispatcher: EventDispatcher;
  private config: EventBusConfiguration;

  constructor(config?: EventBusConfiguration) {
    this.config = config || {
      dispatchMode: DispatchMode.SYNCHRONOUS,
      strictOrdering: true,
      exceptionPolicy: ExceptionPolicy.PROPAGATE
    };
    this.registry = new SubscriberRegistry();
    this.dispatcher = new EventDispatcher(this.registry, this.config);
  }

  public async publish(envelope: EventEnvelope): Promise<EventDispatchResult> {
    const startTime = Date.now();
    let subscriberCount = 0;
    let success = true;

    try {
      subscriberCount = await this.dispatcher.dispatch(envelope);
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      return Object.freeze({
        subscriberCount,
        dispatchDurationMs: duration,
        success
      });
    }
  }

  public subscribe(subscription: EventSubscription): void {
    this.registry.register(subscription);
  }

  public unsubscribe(subscriptionId: string): void {
    this.registry.deregister(subscriptionId);
  }
}
