export class PromotionEventBus {
  private handlers: Record<string, Function[]> = {};

  public subscribe(event: string, handler: Function): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  public publish(event: string, payload: any): void {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(payload));
    }
  }
}
