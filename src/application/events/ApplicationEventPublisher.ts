import { FieldEvent } from '@domain/field/events/FieldEvent';

export class ApplicationEventPublisher {
  public readonly publishedEvents: FieldEvent[] = [];

  public publish(event: FieldEvent): void {
    // Stub implementation for S5-3.
    // In the future, this will forward events to the Monitoring/AIOS Event Bus.
    this.publishedEvents.push(event);
  }
}
