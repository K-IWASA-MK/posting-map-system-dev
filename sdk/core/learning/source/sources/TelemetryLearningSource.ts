import { ILearningSource } from '../ILearningSource';
import { LearningRequest } from '../LearningRequest';
import { LearningDataset } from '../LearningDataset';
import { LearningSourceCapability } from '../LearningSourceCapability';
import { SourceType } from '../SourceType';
import { LearningDatasetBuilder } from '../LearningDatasetBuilder';
import { LearningRecord } from '../LearningRecord';
import { ITelemetryRepository } from '../../../telemetry/ITelemetryRepository';

export class TelemetryLearningSource implements ILearningSource {
  private repository: ITelemetryRepository;

  constructor(repository: ITelemetryRepository) {
    this.repository = repository;
  }

  public supports(request: LearningRequest): boolean {
    return request.sourceType === SourceType.TELEMETRY;
  }

  public capability(): LearningSourceCapability {
    return {
      supportsExecutionFilter: true,
      supportsTimeRange: true,
      supportsCorrelationId: true
    };
  }

  public priority(): number {
    return 80;
  }

  public async load(request: LearningRequest): Promise<LearningDataset> {
    let rawRecords = await this.repository.findAll();

    if (request.executionId) {
      rawRecords = rawRecords.filter(r => r.executionId === request.executionId);
    }

    if (request.correlationId) {
      rawRecords = rawRecords.filter(r => r.correlationId === request.correlationId);
    }

    if (request.timeRange) {
      const start = new Date(request.timeRange.start).getTime();
      const end = new Date(request.timeRange.end).getTime();
      rawRecords = rawRecords.filter(r => {
        const t = new Date(r.timestamp).getTime();
        return t >= start && t <= end;
      });
    }

    const records: LearningRecord[] = rawRecords.map(r => ({
      recordId: r.recordId,
      sourceType: SourceType.TELEMETRY,
      payload: {
        metricName: r.metricName,
        value: r.value,
        unit: r.unit
      },
      timestamp: r.timestamp
    }));

    return LearningDatasetBuilder.build(records, SourceType.TELEMETRY, 1);
  }
}
