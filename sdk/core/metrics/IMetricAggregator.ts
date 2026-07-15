import { TelemetryRecord } from '../telemetry/TelemetryRecord';
import { MetricRecord } from './MetricRecord';
import { MetricAggregationType } from './MetricAggregationType';
import { MetricWindow } from './MetricWindow';

export interface IMetricAggregator {
  aggregate(
    records: TelemetryRecord[],
    window: MetricWindow,
    aggregationType: MetricAggregationType
  ): MetricRecord[];
}
