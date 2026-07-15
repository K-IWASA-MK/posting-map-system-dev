import { IEventSubscriber } from '../eventbus/IEventSubscriber';
import { EventEnvelope } from '../eventbus/EventEnvelope';
import { EventChannel } from '../eventbus/EventChannel';
import { EventType } from '../eventbus/EventType';
import { ITelemetryCollector } from './ITelemetryCollector';
import { TelemetryMapper } from './TelemetryMapper';

export class TelemetryDispatcher implements IEventSubscriber {
  private collector: ITelemetryCollector;
  private mapper: TelemetryMapper;

  constructor(collector: ITelemetryCollector) {
    this.collector = collector;
    this.mapper = new TelemetryMapper();
  }

  public supportsChannel(channel: EventChannel): boolean {
    // Collect from EXECUTION and SYSTEM channels
    return channel === EventChannel.EXECUTION || channel === EventChannel.SYSTEM;
  }

  public supportsEventType(eventType: EventType): boolean {
    // Accept all to support unknown event filtering internally (to skip unknown events cleanly)
    return true;
  }

  public async onEvent(envelope: EventEnvelope): Promise<void> {
    const records = this.mapper.map(envelope);
    for (const record of records) {
      await this.collector.collect(record);
    }
  }

  public priority(): number {
    return 80; // Telemetry runs at priority 80 (below Projections if applicable)
  }
}
