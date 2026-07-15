import { RuntimeEvent } from './RuntimeEvent';
import { RuntimeEventType } from './RuntimeEventType';
import { RuntimeEventListener } from './RuntimeEventListener';
import { Subscription } from './Subscription';

/**
 * IRuntimeEventBus defines the interface for publishing and subscribing to runtime events.
 */
export interface IRuntimeEventBus {
  /**
   * Publishes an event to registered subscribers synchronously.
   * @param event The runtime event package.
   */
  publish(event: RuntimeEvent): void;

  /**
   * Subscribes a listener to a specific event type.
   * @param type Target runtime event type.
   * @param handler Subscriber callback logic.
   */
  subscribe(type: RuntimeEventType, handler: RuntimeEventListener): Subscription;

  /**
   * Subscribes a listener to all event types.
   * @param handler Subscriber callback logic.
   */
  subscribeAll(handler: RuntimeEventListener): Subscription;

  /**
   * Cleans up all registered listeners.
   */
  clearListeners(): void;
}
