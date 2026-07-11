import { MonitoringEvent, EventCategory } from './MonitoringEvent';
import { EventDispatcher } from './EventDispatcher';
import { AuditCollector } from './AuditCollector';
import { MetricsCollector } from './MetricsCollector';

export class MonitoringPipeline {
  private static instance: MonitoringPipeline | null = null;
  private sequenceCounter: number = 0;
  private readonly dispatcher: EventDispatcher;

  private constructor() {
    this.dispatcher = EventDispatcher.getInstance();
    // Default system listeners registration
    this.dispatcher.addListener(AuditCollector.getInstance());
    this.dispatcher.addListener(MetricsCollector.getInstance());
  }

  public static getInstance(): MonitoringPipeline {
    if (!MonitoringPipeline.instance) {
      MonitoringPipeline.instance = new MonitoringPipeline();
    }
    return MonitoringPipeline.instance;
  }

  public resetSequence(): void {
    this.sequenceCounter = 0;
  }

  public createAndDispatch(
    eventType: string,
    category: EventCategory,
    requestId: string,
    source: string,
    payload: Record<string, any>
  ): void {
    this.sequenceCounter++;
    
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const event: MonitoringEvent = {
      eventId,
      eventType,
      category,
      sequenceNumber: this.sequenceCounter,
      requestId,
      timestamp: Date.now(),
      source,
      payload
    };

    this.dispatcher.dispatch(event);
  }
}
