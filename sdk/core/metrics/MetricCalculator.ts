import { MetricRegistry } from './MetricRegistry';
import { MetricAggregationType } from './MetricAggregationType';
import { TelemetryRecord } from '../telemetry/TelemetryRecord';
import { AggregationResult } from './AggregationResult';
import { 
  SumStrategy, 
  AverageStrategy, 
  CountStrategy, 
  MinStrategy, 
  MaxStrategy 
} from './AggregationStrategy';

export class MetricCalculator {
  public calculate(
    records: TelemetryRecord[],
    aggregationType: MetricAggregationType
  ): AggregationResult {
    if (records.length === 0) {
      return Object.freeze({
        value: 0,
        sampleCount: 0,
        aggregationType
      });
    }

    // Validate that metricName supports this aggregation type according to registry
    const metricName = records[0].metricName;
    const def = MetricRegistry.get(metricName);
    if (!def || !def.supportedAggregationTypes.includes(aggregationType)) {
      throw new Error(`Unsupported Aggregation Error: ${aggregationType} is not supported for ${metricName}`);
    }

    let strategy;
    switch (aggregationType) {
      case MetricAggregationType.SUM:
        strategy = new SumStrategy();
        break;
      case MetricAggregationType.AVERAGE:
        strategy = new AverageStrategy();
        break;
      case MetricAggregationType.COUNT:
        strategy = new CountStrategy();
        break;
      case MetricAggregationType.MIN:
        strategy = new MinStrategy();
        break;
      case MetricAggregationType.MAX:
        strategy = new MaxStrategy();
        break;
      default:
        throw new Error(`Unsupported Aggregation Strategy: ${aggregationType}`);
    }

    return strategy.aggregate(records);
  }
}
