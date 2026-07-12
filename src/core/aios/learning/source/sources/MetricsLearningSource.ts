import { ILearningSource } from '../ILearningSource';
import { LearningRequest } from '../LearningRequest';
import { LearningDataset } from '../LearningDataset';
import { LearningSourceCapability } from '../LearningSourceCapability';
import { SourceType } from '../SourceType';
import { LearningDatasetBuilder } from '../LearningDatasetBuilder';
import { LearningRecord } from '../LearningRecord';
import { IMetricsRepository } from '../../../metrics/IMetricsRepository';
import { MetricName } from '../../../telemetry/MetricName';

export class MetricsLearningSource implements ILearningSource {
  private repository: IMetricsRepository;

  constructor(repository: IMetricsRepository) {
    this.repository = repository;
  }

  public supports(request: LearningRequest): boolean {
    return request.sourceType === SourceType.METRICS;
  }

  public capability(): LearningSourceCapability {
    // Metrics does not map execution/session filters easily without joining (so we declare false)
    return {
      supportsExecutionFilter: false,
      supportsTimeRange: false,
      supportsCorrelationId: false
    };
  }

  public priority(): number {
    return 60;
  }

  public async load(request: LearningRequest): Promise<LearningDataset> {
    let rawRecords = await this.repository.findAll();

    // Filters can be matched against metricName if provided in request filters
    const filterMetricName = request.filters['metricName'] as MetricName;
    if (filterMetricName) {
      rawRecords = rawRecords.filter(r => r.metricName === filterMetricName);
    }

    const records: LearningRecord[] = rawRecords.map(r => ({
      recordId: r.metricId,
      sourceType: SourceType.METRICS,
      payload: {
        metricName: r.metricName,
        value: r.value,
        aggregationType: r.aggregationType,
        sampleCount: r.sampleCount
      },
      timestamp: r.generatedAt
    }));

    return LearningDatasetBuilder.build(records, SourceType.METRICS, 1);
  }
}
