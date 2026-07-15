import { ITelemetryRepository } from '../telemetry/ITelemetryRepository';
import { IMetricsRepository } from './IMetricsRepository';
import { MetricAggregator } from './MetricAggregator';
import { MetricName } from '../telemetry/MetricName';
import { MetricWindow } from './MetricWindow';
import { MetricAggregationType } from './MetricAggregationType';

export class MetricsDispatcher {
  private telemetryRepo: ITelemetryRepository;
  private metricsRepo: IMetricsRepository;
  private aggregator: MetricAggregator;

  constructor(
    telemetryRepo: ITelemetryRepository,
    metricsRepo: IMetricsRepository,
    aggregator: MetricAggregator
  ) {
    this.telemetryRepo = telemetryRepo;
    this.metricsRepo = metricsRepo;
    this.aggregator = aggregator;
  }

  public async aggregateAndStore(
    name: MetricName,
    window: MetricWindow,
    aggregationType: MetricAggregationType
  ): Promise<number> {
    // 1. Fetch raw telemetry records for the metric
    const allTelemetry = await this.telemetryRepo.findAll();
    const targetTelemetry = allTelemetry.filter(r => r.metricName === name);

    if (targetTelemetry.length === 0) return 0;

    // 2. Perform aggregation
    const results = this.aggregator.aggregate(targetTelemetry, window, aggregationType);

    // 3. Store aggregated metric records
    for (const record of results) {
      await this.metricsRepo.save(record);
    }

    return results.length;
  }
}
