import { MetricAggregationType } from './MetricAggregationType';

export interface AggregationResult {
  readonly value: number;
  readonly sampleCount: number;
  readonly aggregationType: MetricAggregationType;
}
