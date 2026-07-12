import { InMemoryMetricsRepository } from './InMemoryMetricsRepository';
import { MetricAggregator } from './MetricAggregator';
import { MetricsDispatcher } from './MetricsDispatcher';
import { ITelemetryRepository } from '../telemetry/ITelemetryRepository';

export class MetricsFactory {
  public static createInMemory(telemetryRepo: ITelemetryRepository) {
    const repository = new InMemoryMetricsRepository();
    const aggregator = new MetricAggregator();
    const dispatcher = new MetricsDispatcher(telemetryRepo, repository, aggregator);

    return {
      repository,
      aggregator,
      dispatcher
    };
  }
}
