import { AIOSEvent } from '../event/AIOSEvent';
import { IAIOSEventBus, EventHandler } from '../event/AIOSEventBus';

export class RuntimeEventSubscriber {
  private registeredHandlers = new Map<string, EventHandler>();

  constructor(
    private readonly runtimeId: string,
    private readonly eventBus: IAIOSEventBus
  ) {}

  public subscribe(eventType: string, handler: EventHandler): void {
    // Optionally wrap handler to trace consumption by this runtime
    const wrappedHandler: EventHandler = async (event: AIOSEvent<any>) => {
      // Don't process events emitted by self unless explicitly needed? 
      // For now, allow it, but we could filter here.
      await handler(event);
    };

    this.registeredHandlers.set(eventType, wrappedHandler);
    this.eventBus.subscribe(eventType, wrappedHandler);
  }

  public unsubscribe(eventType: string): void {
    const handler = this.registeredHandlers.get(eventType);
    if (handler) {
      this.eventBus.unsubscribe(eventType, handler);
      this.registeredHandlers.delete(eventType);
    }
  }

  public unsubscribeAll(): void {
    for (const [eventType, handler] of this.registeredHandlers.entries()) {
      this.eventBus.unsubscribe(eventType, handler);
    }
    this.registeredHandlers.clear();
  }
}
