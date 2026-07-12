import { IEventSubscriber } from '../eventbus/IEventSubscriber';
import { EventEnvelope } from '../eventbus/EventEnvelope';
import { EventChannel } from '../eventbus/EventChannel';
import { EventType } from '../eventbus/EventType';
import { IProjectionBuilder } from './IProjectionBuilder';

export class ProjectionDispatcher implements IEventSubscriber {
  private builder: IProjectionBuilder;

  constructor(builder: IProjectionBuilder) {
    this.builder = builder;
  }

  public supportsChannel(channel: EventChannel): boolean {
    return channel === EventChannel.EXECUTION || channel === EventChannel.SYSTEM;
  }

  public supportsEventType(eventType: EventType): boolean {
    return true; // Let the builder internal switch decide what to process
  }

  public async onEvent(envelope: EventEnvelope): Promise<void> {
    await this.builder.build(envelope);
  }

  public priority(): number {
    return 90; // Projections run at priority 90 (above Telemetry)
  }
}
