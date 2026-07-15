import { AIOSEvent } from '../event/AIOSEvent';
import { IAIOSEventBus } from '../event/AIOSEventBus';

export class RuntimeEventPublisher {
  constructor(
    private readonly runtimeId: string,
    private readonly eventBus: IAIOSEventBus
  ) {}

  public async publish<T = Record<string, unknown>>(
    eventType: string,
    payload: T,
    correlationId: string,
    causationId: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const event: AIOSEvent<T> = {
      eventId,
      eventType,
      eventVersion: '1.0',
      occurredAt: new Date().toISOString(),
      producerRuntimeId: this.runtimeId,
      correlationId,
      causationId,
      payload,
      metadata
    };

    await this.eventBus.publish(event);
    return eventId;
  }
}
