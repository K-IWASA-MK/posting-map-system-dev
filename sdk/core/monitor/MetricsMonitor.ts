import { IMonitorService } from './IMonitorService';
import { IMetricsRepository } from '../metrics/IMetricsRepository';
import { MetricName } from '../telemetry/MetricName';

export class MetricsMonitor implements IMonitorService {
  private metricsRepo: IMetricsRepository;

  constructor(metricsRepo: IMetricsRepository) {
    this.metricsRepo = metricsRepo;
  }

  public name(): string {
    return 'metrics';
  }

  public supports(queryType: string): boolean {
    return queryType === 'metrics';
  }

  public async query(): Promise<Record<string, any>> {
    const durationMetrics = await this.metricsRepo.findByMetricName(MetricName.EXECUTION_DURATION);
    const confidenceMetrics = await this.metricsRepo.findByMetricName(MetricName.REVIEWER_CONFIDENCE);
    const pluginMetrics = await this.metricsRepo.findByMetricName(MetricName.PLUGIN_COUNT);

    const averageExecutionTime = durationMetrics.length > 0 ? durationMetrics[durationMetrics.length - 1].value : 0;
    const executionCount = durationMetrics.length > 0 ? durationMetrics[durationMetrics.length - 1].sampleCount : 0;
    const averageReviewConfidence = confidenceMetrics.length > 0 ? confidenceMetrics[confidenceMetrics.length - 1].value : 0;
    const pluginExecutionCount = pluginMetrics.length > 0 ? pluginMetrics[pluginMetrics.length - 1].value : 0;

    return {
      averageExecutionTime,
      executionCount,
      averageReviewConfidence,
      pluginExecutionCount
    };
  }
}
