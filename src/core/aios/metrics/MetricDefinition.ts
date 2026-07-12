import { MetricCategory } from '../telemetry/MetricCategory';
import { MetricUnit } from '../telemetry/MetricUnit';
import { MetricName } from '../telemetry/MetricName';
import { MetricAggregationType } from './MetricAggregationType';
import { MetricWindow } from './MetricWindow';

export interface MetricDefinition {
  readonly metricName: MetricName;
  readonly metricCategory: MetricCategory;
  readonly defaultUnit: MetricUnit;
  readonly supportedAggregationTypes: readonly MetricAggregationType[];
  readonly supportedWindows: readonly MetricWindow[];
  readonly description: string;
  readonly schemaVersion: string;
}
