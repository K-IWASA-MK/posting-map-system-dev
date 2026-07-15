import { IPatternQueryService } from '../../learning/query/IPatternQueryService';
import { KnowledgeSourceConfiguration } from './KnowledgeSourceConfiguration';
import { KnowledgeSourceResolver } from './KnowledgeSourceResolver';
import { IKnowledgeSourceResolver } from './IKnowledgeSourceResolver';

export class KnowledgeSourceFactory {
  public static create(
    queryService: IPatternQueryService,
    config?: Partial<KnowledgeSourceConfiguration>
  ): IKnowledgeSourceResolver {
    const finalConfig: KnowledgeSourceConfiguration = {
      schemaVersion: '1.0.0',
      maxPatternsLimit: config?.maxPatternsLimit,
      defaultPatternTypes: config?.defaultPatternTypes || [],
      sortingField: config?.sortingField || 'patternId'
    };

    return new KnowledgeSourceResolver(queryService, finalConfig);
  }
}
