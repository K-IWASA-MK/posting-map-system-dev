import { IMetricsRepository } from './IMetricsRepository';
import { MetricRecord } from './MetricRecord';
import { MetricRegistry } from './MetricRegistry';
import { MetricName } from '../telemetry/MetricName';

export class InMemoryMetricsRepository implements IMetricsRepository {
  private records: Map<string, MetricRecord> = new Map();

  public async save(record: MetricRecord): Promise<void> {
    this.validate(record);

    // Save Policy: Replace based on unique aggregation key to prevent duplicates
    // Key: metricName + aggregationType + window + metricId (which represents executionId / sessionId / window boundary key)
    const key = `${record.metricName}-${record.aggregationType}-${record.window}-${record.metricId}`;
    this.records.set(key, record);
  }

  public async findAll(): Promise<MetricRecord[]> {
    return Array.from(this.records.values());
  }

  public async findByMetricName(name: MetricName): Promise<MetricRecord[]> {
    return Array.from(this.records.values()).filter(r => r.metricName === name);
  }

  public async exists(metricId: string): Promise<boolean> {
    return Array.from(this.records.values()).some(r => r.metricId === metricId);
  }

  public async count(): Promise<number> {
    return this.records.size;
  }

  private validate(record: MetricRecord): void {
    const def = MetricRegistry.get(record.metricName);
    if (!def) {
      throw new Error(`Definition Error: Unknown metric name ${record.metricName}`);
    }

    if (!def.supportedAggregationTypes.includes(record.aggregationType)) {
      throw new Error(`Definition Validation Error: ${record.aggregationType} is not supported for ${record.metricName}`);
    }

    if (!def.supportedWindows.includes(record.window)) {
      throw new Error(`Definition Validation Error: ${record.window} window is not supported for ${record.metricName}`);
    }
  }
}
