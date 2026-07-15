import { MetricCategory } from './MetricCategory';
import { MetricUnit } from './MetricUnit';
import { MetricName } from './MetricName';

export interface TelemetryRecord {
  readonly recordId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly metricCategory: MetricCategory;
  readonly metricName: MetricName;
  readonly value: number; // Forcing numeric value constraint
  readonly unit: MetricUnit;
  readonly timestamp: string;
  readonly source: string;
  readonly sourceType: 'Execution' | 'Plugin' | 'Reviewer' | 'System';
  readonly schemaVersion: string;
}
