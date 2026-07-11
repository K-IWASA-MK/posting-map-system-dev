import { MonitoringListener } from './MonitoringListener';
import { MonitoringEvent } from './MonitoringEvent';

export class AuditCollector implements MonitoringListener {
  private static instance: AuditCollector | null = null;
  private readonly events: MonitoringEvent[] = [];

  private constructor() {}

  public static getInstance(): AuditCollector {
    if (!AuditCollector.instance) {
      AuditCollector.instance = new AuditCollector();
    }
    return AuditCollector.instance;
  }

  public onEvent(event: MonitoringEvent): void {
    if (
      event.category === 'AUDIT' ||
      event.category === 'LIFECYCLE' ||
      event.category === 'EXCEPTION'
    ) {
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
