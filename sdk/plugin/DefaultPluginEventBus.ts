import { PluginEventBus, PluginEventPayload, PluginEventHandler } from '../contracts';

export class DefaultPluginEventBus implements PluginEventBus {
  private readonly handlers: Map<string, Set<PluginEventHandler>> = new Map();
  constructor(private readonly pluginId: string) {}

  public async publish(event: Omit<PluginEventPayload, 'eventId' | 'timestamp' | 'sourcePluginId'>): Promise<void> {
    const payload: PluginEventPayload = {
      ...event,
      eventId: `EV-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      sourcePluginId: this.pluginId,
    };
    
    const eventHandlers = this.handlers.get(payload.type);
    if (eventHandlers) {
      const promises = Array.from(eventHandlers).map(handler => handler(payload));
      await Promise.allSettled(promises);
    }
  }

  public subscribe(eventType: string, handler: PluginEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  public unsubscribe(eventType: string, handler: PluginEventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
    }
  }
}
