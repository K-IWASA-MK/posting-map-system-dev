import { TelemetryRecord } from '../telemetry/TelemetryRecord';
import { MetricWindow } from './MetricWindow';

export class WindowResolver {
  public resolve(
    records: TelemetryRecord[],
    window: MetricWindow
  ): Map<string, TelemetryRecord[]> {
    const groups: Map<string, TelemetryRecord[]> = new Map();

    for (const record of records) {
      let key = '';
      switch (window) {
        case MetricWindow.EXECUTION:
          key = record.executionId;
          break;
        case MetricWindow.SESSION:
          key = record.correlationId;
          break;
        case MetricWindow.ONE_MINUTE: {
          // Truncate timestamp to minute boundary
          const date = new Date(record.timestamp);
          date.setSeconds(0, 0);
          key = date.toISOString();
          break;
        }
        case MetricWindow.FIVE_MINUTES: {
          const date = new Date(record.timestamp);
          const minutes = date.getMinutes();
          const roundedMinutes = Math.floor(minutes / 5) * 5;
          date.setMinutes(roundedMinutes, 0, 0);
          key = date.toISOString();
          break;
        }
        case MetricWindow.ONE_HOUR: {
          const date = new Date(record.timestamp);
          date.setMinutes(0, 0, 0);
          key = date.toISOString();
          break;
        }
        default:
          key = 'default';
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    return groups;
  }
}
