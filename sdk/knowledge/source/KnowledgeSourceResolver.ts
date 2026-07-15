import { IKnowledgeSourceResolver } from './IKnowledgeSourceResolver';
import { KnowledgeRequest } from '../contracts/KnowledgeRequest';
import { KnowledgeDiscoveryResult } from './KnowledgeDiscoveryResult';
import { IPatternQueryService } from '../../learning/query/IPatternQueryService';
import { KnowledgeSourceConfiguration } from './KnowledgeSourceConfiguration';
import { KnowledgeDatasetBuilder } from './KnowledgeDatasetBuilder';
import { KnowledgeDatasetMetadataFactory } from './KnowledgeDatasetMetadataFactory';
import { PatternType } from '../../learning/contracts';

export class KnowledgeSourceResolver implements IKnowledgeSourceResolver {
  constructor(
    private readonly queryService: IPatternQueryService,
    private readonly config: KnowledgeSourceConfiguration
  ) {}

  public async resolve(request: KnowledgeRequest): Promise<KnowledgeDiscoveryResult> {
    const startTime = Date.now();
    
    // Type-safe filter extraction
    const patternTypeFilter = typeof request.filters.patternType === 'string'
      ? (request.filters.patternType as PatternType)
      : undefined;

    // Fetch via queryService
    const queryResult = await this.queryService.query({
      schemaVersion: '1.0.0',
      queryId: `Q-${request.requestId}`,
      patternType: patternTypeFilter
    });

    let patterns = queryResult.patterns;

    if (this.config.maxPatternsLimit && patterns.length > this.config.maxPatternsLimit) {
      patterns = patterns.slice(0, this.config.maxPatternsLimit);
    }

    // Delegate metadata generation
    const metadata = KnowledgeDatasetMetadataFactory.create(patterns, this.config.schemaVersion);

    // Build dataset using builder
    const dataset = KnowledgeDatasetBuilder.create()
      .patterns(patterns)
      .metadata(metadata)
      .build(this.config.sortingField);

    const durationMs = Date.now() - startTime;
    const resolvedAt = metadata.generatedAt;

    return Object.freeze({
      requestId: request.requestId,
      datasetId: metadata.datasetId,
      dataset,
      patternCount: dataset.patterns.length,
      durationMs,
      sourceCount: dataset.metadata.sourceCount,
      resolvedAt
    });
  }
}
