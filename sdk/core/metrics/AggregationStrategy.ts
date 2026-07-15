import { TelemetryRecord } from '../telemetry/TelemetryRecord';
import { AggregationResult } from './AggregationResult';
import { MetricAggregationType } from './MetricAggregationType';

export interface AggregationStrategy {
  aggregate(records: TelemetryRecord[]): AggregationResult;
}

export class SumStrategy implements AggregationStrategy {
  public aggregate(records: TelemetryRecord[]): AggregationResult {
    const value = records.reduce((acc, r) => acc + r.value, 0);
    return Object.freeze({
      value,
      sampleCount: records.length,
      aggregationType: MetricAggregationType.SUM
    });
  }
}

export class AverageStrategy implements AggregationStrategy {
  public aggregate(records: TelemetryRecord[]): AggregationResult {
    const total = records.reduce((acc, r) => acc + r.value, 0);
    const value = records.length > 0 ? total / records.length : 0;
    return Object.freeze({
      value,
      sampleCount: records.length,
      aggregationType: MetricAggregationType.AVERAGE
    });
  }
}

export class CountStrategy implements AggregationStrategy {
  public aggregate(records: TelemetryRecord[]): AggregationResult {
    return Object.freeze({
      value: records.length,
      sampleCount: records.length,
      aggregationType: MetricAggregationType.COUNT
    });
  }
}

export class MinStrategy implements AggregationStrategy {
  public aggregate(records: TelemetryRecord[]): AggregationResult {
    const value = records.length > 0 ? Math.min(...records.map(r => r.value)) : 0;
    return Object.freeze({
      value,
      sampleCount: records.length,
      aggregationType: MetricAggregationType.MIN
    });
  }
}

export class MaxStrategy implements AggregationStrategy {
  public aggregate(records: TelemetryRecord[]): AggregationResult {
    const value = records.length > 0 ? Math.max(...records.map(r => r.value)) : 0;
    return Object.freeze({
      value,
      sampleCount: records.length,
      aggregationType: MetricAggregationType.MAX
    });
  }
}
