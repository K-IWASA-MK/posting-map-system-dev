import { RuntimeEvent } from "../contracts/RuntimeEventContract";

export type RuntimeEventSubscriber = (event: RuntimeEvent) => void | Promise<void>;

export class RuntimeEventBus {
  private readonly subscribers = new Map<string, Set<RuntimeEventSubscriber>>();

  /**
   * Subscribes a listener to a specific event type.
   */
  public subscribe(eventType: string, subscriber: RuntimeEventSubscriber): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(subscriber);
  }

  /**
   * Unsubscribes a listener from a specific event type.
   */
  public unsubscribe(eventType: string, subscriber: RuntimeEventSubscriber): void {
    const subs = this.subscribers.get(eventType);
    if (subs) {
      subs.delete(subscriber);
    }
  }

  /**
   * Publishes an event to all subscribed listeners.
   * Isolates listener exceptions to ensure one subscriber failure does not block other handlers.
   */
  public async publish(event: RuntimeEvent): Promise<{ success: boolean; errors: Error[] }> {
    const subs = this.subscribers.get(event.eventType);
    if (!subs || subs.size === 0) {
      return { success: true, errors: [] };
    }

    const errors: Error[] = [];
    const promises: Promise<void>[] = [];

    for (const sub of subs) {
      const p = (async () => {
        try {
          await sub(event);
        } catch (err: any) {
          const errorInstance = err instanceof Error ? err : new Error(String(err));
          errors.push(errorInstance);
          console.error(`[RuntimeEventBus] Subscriber failed on event ${event.eventId}: ${errorInstance.message}`);
        }
      })();
      promises.push(p);
    }

    // Wait for all subscriptions to process
    await Promise.all(promises);

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Clears all current subscription registrations.
   */
  public clear(): void {
    this.subscribers.clear();
  }
}
