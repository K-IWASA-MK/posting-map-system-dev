import { IMetricAggregator } from './IMetricAggregator';
import { MetricRecord } from './MetricRecord';
import { MetricAggregationType } from './MetricAggregationType';
import { MetricWindow } from './MetricWindow';
import { TelemetryRecord } from '../telemetry/TelemetryRecord';
import { WindowResolver } from './WindowResolver';
import { MetricCalculator } from './MetricCalculator';
import { MetricRegistry } from './MetricRegistry';

export class MetricAggregator implements IMetricAggregator {
  private windowResolver: WindowResolver;
  private calculator: MetricCalculator;

  constructor() {
    this.windowResolver = new WindowResolver();
    this.calculator = new MetricCalculator();
  }

  public aggregate(
    records: TelemetryRecord[],
    window: MetricWindow,
    aggregationType: MetricAggregationType
  ): MetricRecord[] {
    if (records.length === 0) return [];

    const metricName = records[0].metricName;
    const def = MetricRegistry.get(metricName);
    if (!def) {
      throw new Error(`Definition Error: Unknown metric name ${metricName}`);
    }

    const groups = this.windowResolver.resolve(records, window);
    const metricRecords: MetricRecord[] = [];

    for (const [key, groupRecords] of groups.entries()) {
      const result = this.calculator.calculate(groupRecords, aggregationType);
      
      const record: MetricRecord = Object.freeze({
        metricId: key, // Serves as the unique identity of this window slice (e.g. executionId, ISO timestamp boundary)
        metricName,
        metricCategory: def.metricCategory,
        aggregationType,
        window,
        value: result.value,
        unit: def.defaultUnit,
        sampleCount: result.sampleCount,
        generatedAt: new Date().toISOString(),
        schemaVersion: '1.0.0'
      });

      metricRecords.push(record);
    }

    return metricRecords;
  }
}
