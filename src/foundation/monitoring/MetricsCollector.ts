import { MonitoringListener } from './MonitoringListener';
import { MonitoringEvent } from './MonitoringEvent';

export class MetricsCollector implements MonitoringListener {
  private static instance: MetricsCollector | null = null;
  private readonly events: MonitoringEvent[] = [];

  private constructor() {}

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  public onEvent(event: MonitoringEvent): void {
    if (event.category === 'METRICS') {
      this.events.push(event);
    }
  }

  public getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  public clear(): void {
    this.events.length = 0;
  }
}
