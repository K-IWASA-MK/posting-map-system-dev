import { MetricRecord } from './MetricRecord';
import { MetricName } from '../telemetry/MetricName';

export interface IMetricsRepository {
  save(record: MetricRecord): Promise<void>;
  findAll(): Promise<MetricRecord[]>;
  findByMetricName(name: MetricName): Promise<MetricRecord[]>;
  exists(metricId: string): Promise<boolean>;
  count(): Promise<number>;
}
