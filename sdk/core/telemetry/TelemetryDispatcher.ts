import { AIOSEvent } from '../event/AIOSEvent';
import { ITelemetryCollector } from './ITelemetryCollector';
import { TelemetryMapper } from './TelemetryMapper';

export class TelemetryDispatcher {
  private collector: ITelemetryCollector;
  private mapper: TelemetryMapper;

  constructor(collector: ITelemetryCollector) {
    this.collector = collector;
    this.mapper = new TelemetryMapper();
  }

  public async onEvent(event: AIOSEvent): Promise<void> {
    const records = this.mapper.map(event);
    for (const record of records) {
      await this.collector.collect(record);
    }
  }

  public priority(): number {
    return 80; // Telemetry runs at priority 80 (below Projections if applicable)
  }
}

