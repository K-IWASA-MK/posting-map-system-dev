type EventHandler = (payload?: any) => void;

export class EvolutionEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  publish(event: string, payload?: any): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(payload));
    }
  }
}
