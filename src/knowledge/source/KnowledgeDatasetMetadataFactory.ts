import { LearningPattern } from '../../learning/contracts';
import { KnowledgeDatasetMetadata } from '../contracts/KnowledgeDataset';
import { KnowledgeDatasetIdGenerator } from './KnowledgeDatasetIdGenerator';
import { KnowledgeDatasetTimestampResolver } from './KnowledgeDatasetTimestampResolver';

export class KnowledgeDatasetMetadataFactory {
  public static create(
    patterns: ReadonlyArray<LearningPattern>,
    schemaVersion: string
  ): KnowledgeDatasetMetadata {
    const patternIds = patterns.map(p => p.patternId);
    const datasetId = KnowledgeDatasetIdGenerator.generate(patternIds);
    const patternTypes = Array.from(new Set(patterns.map(p => p.patternType)));
    
    const sourceDatasetIds = new Set<string>();
    patterns.forEach(p => p.sourceDatasetIds.forEach(id => sourceDatasetIds.add(id)));

    return {
      datasetId,
      recordCount: patterns.length,
      sourceCount: sourceDatasetIds.size,
      generatedAt: KnowledgeDatasetTimestampResolver.resolve(patterns),
      schemaVersion,
      patternTypes
    };
  }
}
