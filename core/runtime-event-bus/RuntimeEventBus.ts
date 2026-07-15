import { IRuntimeEventBus } from './IRuntimeEventBus';
import { RuntimeEvent } from './RuntimeEvent';
import { RuntimeEventType } from './RuntimeEventType';
import { RuntimeEventListener } from './RuntimeEventListener';
import { Subscription } from './Subscription';
import { RuntimeSubscription } from './RuntimeSubscription';
import { IEventIdProvider } from './IEventIdProvider';

/**
 * RuntimeEventBus routes platform events synchronously and isolates subscriber failures.
 * Conforms to: Event Bus propagates events only (no retry, no persist, isolates failures).
 */
export class RuntimeEventBus implements IRuntimeEventBus {
  private readonly idProvider: IEventIdProvider;
  private readonly typeListeners = new Map<RuntimeEventType, Set<RuntimeEventListener>>();
  private readonly wildcardListeners = new Set<RuntimeEventListener>();

  constructor(idProvider: IEventIdProvider) {
    this.idProvider = idProvider;
  }

  /**
   * Publishes an event to registered specific type and wildcard listeners.
   * Isolates callback failures so one failing listener doesn't block execution.
   * @param event Structured runtime event package.
   */
  public publish(event: RuntimeEvent): void {
    // 1. Dispatch to type-specific handlers
    const specificSet = this.typeListeners.get(event.type);
    if (specificSet) {
      for (const listener of specificSet) {
        this.safeInvoke(listener, event);
      }
    }

    // 2. Dispatch to wildcard handlers
    for (const listener of this.wildcardListeners) {
      this.safeInvoke(listener, event);
    }
  }

  /**
   * Subscribes a listener to a specific event type.
   * @param type Target runtime event type.
   * @param handler Subscriber callback logic.
   */
  public subscribe(type: RuntimeEventType, handler: RuntimeEventListener): Subscription {
    let set = this.typeListeners.get(type);
    if (!set) {
      set = new Set<RuntimeEventListener>();
      this.typeListeners.set(type, set);
    }
    set.add(handler);

    return new RuntimeSubscription(() => {
      const targetSet = this.typeListeners.get(type);
      if (targetSet) {
        targetSet.delete(handler);
      }
    });
  }

  /**
   * Subscribes a listener to all event types.
   * @param handler Subscriber callback logic.
   */
  public subscribeAll(handler: RuntimeEventListener): Subscription {
    this.wildcardListeners.add(handler);
    return new RuntimeSubscription(() => {
      this.wildcardListeners.delete(handler);
    });
  }

  /**
   * Unbinds all listeners from the bus map.
   */
  public clearListeners(): void {
    this.typeListeners.clear();
    this.wildcardListeners.clear();
  }

  private safeInvoke(listener: RuntimeEventListener, event: RuntimeEvent): void {
    try {
      listener(event);
    } catch (err: any) {
      console.warn(
        `[RuntimeEventBus] Handled subscriber exception for type '${event.type}'. Error: ${err.message}`
      );
    }
  }
}
