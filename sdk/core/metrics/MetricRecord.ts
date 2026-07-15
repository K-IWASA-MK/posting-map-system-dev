import { MetricCategory } from '../telemetry/MetricCategory';
import { MetricUnit } from '../telemetry/MetricUnit';
import { MetricName } from '../telemetry/MetricName';
import { MetricAggregationType } from './MetricAggregationType';
import { MetricWindow } from './MetricWindow';

export interface MetricRecord {
  readonly metricId: string;
  readonly metricName: MetricName;
  readonly metricCategory: MetricCategory;
  readonly aggregationType: MetricAggregationType;
  readonly window: MetricWindow;
  readonly value: number;
  readonly unit: MetricUnit;
  readonly sampleCount: number;
  readonly generatedAt: string;
  readonly schemaVersion: string;
  readonly confidence?: number; // Optional reserved field for sample-size based reliability
}
