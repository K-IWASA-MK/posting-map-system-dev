import { SubscriberRegistry } from './SubscriberRegistry';
import { EventEnvelope } from './EventEnvelope';
import { EventBusConfiguration } from './EventBusConfiguration';
import { DispatchContext } from './DispatchContext';

export class EventDispatcher {
  private registry: SubscriberRegistry;
  private config: EventBusConfiguration;

  constructor(registry: SubscriberRegistry, config: EventBusConfiguration) {
    this.registry = registry;
    this.config = config;
  }

  public async dispatch(envelope: EventEnvelope): Promise<number> {
    const targets = this.registry.findSubscribersFor(envelope);
    if (targets.length === 0) return 0;

    // 1. Sort subscribers by Priority (highest first)
    targets.sort((a, b) => b.subscriber.priority() - a.subscriber.priority());

    const dispatchContext: DispatchContext = Object.freeze({
      dispatchId: `DISP-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      dispatchTimestamp: new Date().toISOString(),
      subscriberCount: targets.length
    });

    // 2. Synchronous sequential notification
    for (const target of targets) {
      try {
        await target.subscriber.onEvent(envelope);
      } catch (error) {
        // Rule: Propagate exceptions upwards, do not swallow.
        // Even if config is extendable in the future, currently we enforce ExceptionPolicy.PROPAGATE
        throw error;
      }
    }

    return targets.length;
  }
}
