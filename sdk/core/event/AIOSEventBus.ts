import { AIOSEvent } from './AIOSEvent';

export type EventHandler = (event: AIOSEvent<any>) => Promise<void>;

export interface IAIOSEventBus {
  publish(event: AIOSEvent<any>): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

export class AIOSEventBus implements IAIOSEventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  public async publish(event: AIOSEvent<any>): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType) || new Set();
    const wildcardHandlers = this.handlers.get('*') || new Set();
    
    const allHandlers = new Set([...eventHandlers, ...wildcardHandlers]);
    
    if (allHandlers.size > 0) {
      const promises = Array.from(allHandlers).map(handler => handler(event).catch(err => {
        console.error(`[AIOSEventBus] Error handling event ${event.eventId} (${event.eventType}):`, err);
      }));
      await Promise.all(promises);
    }
  }

  public subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  public unsubscribe(eventType: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }
}
