import { MonitoringEvent } from './MonitoringEvent';
import { MonitoringListener } from './MonitoringListener';

export class EventDispatcher {
  private static instance: EventDispatcher | null = null;
  private readonly listeners: MonitoringListener[] = [];

  private constructor() {}

  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  public addListener(listener: MonitoringListener): void {
    this.listeners.push(listener);
  }

  public clearListeners(): void {
    this.listeners.length = 0;
  }

  public dispatch(event: MonitoringEvent): void {
    for (const listener of this.listeners) {
      try {
        listener.onEvent(event);
      } catch (err) {
        console.error('[EventDispatcher Dispatch Error]', err);
      }
    }
  }
}
