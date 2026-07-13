import { TelemetryRecord } from './TelemetryRecord';

export interface ITelemetryCollector {
  collect(record: TelemetryRecord): Promise<void>;
}
