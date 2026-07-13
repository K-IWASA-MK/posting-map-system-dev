import { ILearningSource } from '../ILearningSource';
import { LearningRequest } from '../LearningRequest';
import { LearningDataset } from '../LearningDataset';
import { LearningSourceCapability } from '../LearningSourceCapability';
import { SourceType } from '../SourceType';
import { LearningDatasetBuilder } from '../LearningDatasetBuilder';
import { LearningRecord } from '../LearningRecord';
import { LearningSourceRegistry } from '../LearningSourceRegistry';

export class CompositeLearningSource implements ILearningSource {
  private registry: LearningSourceRegistry;

  constructor(registry: LearningSourceRegistry) {
    this.registry = registry;
  }

  public supports(request: LearningRequest): boolean {
    return request.sourceType === SourceType.COMPOSITE;
  }

  public capability(): LearningSourceCapability {
    // Composite composite supports what is required by downstream
    return {
      supportsExecutionFilter: true,
      supportsTimeRange: false,
      supportsCorrelationId: true
    };
  }

  public priority(): number {
    return 40;
  }

  public async load(request: LearningRequest): Promise<LearningDataset> {
    const sources = this.registry.getAll().filter(s => s !== this);
    const recordsMap: Map<string, LearningRecord> = new Map();
    let sourcesCount = 0;

    for (const source of sources) {
      // Create request matching this concrete source
      let childSourceType: SourceType;
      if (source.supports({ ...request, sourceType: SourceType.LEDGER })) {
        childSourceType = SourceType.LEDGER;
      } else if (source.supports({ ...request, sourceType: SourceType.TELEMETRY })) {
        childSourceType = SourceType.TELEMETRY;
      } else if (source.supports({ ...request, sourceType: SourceType.METRICS })) {
        childSourceType = SourceType.METRICS;
      } else {
        continue;
      }

      const childRequest: LearningRequest = {
        ...request,
        sourceType: childSourceType
      };

      try {
        const dataset = await source.load(childRequest);
        if (dataset.records.length > 0) {
          sourcesCount++;
          for (const rec of dataset.records) {
            // Deduplication: Map by recordId
            recordsMap.set(rec.recordId, rec);
          }
        }
      } catch (error) {
        // Skip faulty sources safely without crashing Composite
      }
    }

    return LearningDatasetBuilder.build(
      Array.from(recordsMap.values()),
      SourceType.COMPOSITE,
      sourcesCount
    );
  }
}
