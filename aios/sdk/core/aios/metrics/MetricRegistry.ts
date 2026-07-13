import { MetricDefinition } from './MetricDefinition';
import { MetricName } from '../telemetry/MetricName';
import { MetricCategory } from '../telemetry/MetricCategory';
import { MetricUnit } from '../telemetry/MetricUnit';
import { MetricAggregationType } from './MetricAggregationType';
import { MetricWindow } from './MetricWindow';

export class MetricRegistry {
  private static definitions: Map<MetricName, MetricDefinition> = new Map([
    [
      MetricName.EXECUTION_DURATION,
      {
        metricName: MetricName.EXECUTION_DURATION,
        metricCategory: MetricCategory.EXECUTION,
        defaultUnit: MetricUnit.MS,
        supportedAggregationTypes: [MetricAggregationType.AVERAGE, MetricAggregationType.MIN, MetricAggregationType.MAX, MetricAggregationType.SUM],
        supportedWindows: [MetricWindow.EXECUTION, MetricWindow.ONE_MINUTE, MetricWindow.ONE_HOUR],
        description: 'Time taken for execution',
        schemaVersion: '1.0.0'
      }
    ],
    [
      MetricName.REVIEWER_CONFIDENCE,
      {
        metricName: MetricName.REVIEWER_CONFIDENCE,
        metricCategory: MetricCategory.QUALITY,
        defaultUnit: MetricUnit.PERCENT,
        supportedAggregationTypes: [MetricAggregationType.AVERAGE, MetricAggregationType.MIN, MetricAggregationType.MAX],
        supportedWindows: [MetricWindow.EXECUTION, MetricWindow.SESSION],
        description: 'Reviewer confidence score',
        schemaVersion: '1.0.0'
      }
    ],
    [
      MetricName.PLUGIN_COUNT,
      {
        metricName: MetricName.PLUGIN_COUNT,
        metricCategory: MetricCategory.EXECUTION,
        defaultUnit: MetricUnit.COUNT,
        supportedAggregationTypes: [MetricAggregationType.SUM, MetricAggregationType.COUNT],
        supportedWindows: [MetricWindow.EXECUTION, MetricWindow.ONE_MINUTE],
        description: 'Number of executed plugins',
        schemaVersion: '1.0.0'
      }
    ]
  ]);

  public static get(name: MetricName): MetricDefinition | null {
    return this.definitions.get(name) || null;
  }

  public static register(def: MetricDefinition): void {
    this.definitions.set(def.metricName, def);
  }

  public static getAll(): MetricDefinition[] {
    return Array.from(this.definitions.values());
  }
}
