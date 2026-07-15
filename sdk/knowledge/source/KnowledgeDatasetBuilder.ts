import { LearningPattern } from '../../learning/contracts';
import { KnowledgeDataset, KnowledgeDatasetMetadata } from '../contracts/KnowledgeDataset';

export class KnowledgeDatasetBuilder {
  private _patterns: LearningPattern[] = [];
  private _metadata?: KnowledgeDatasetMetadata;

  public static create(): KnowledgeDatasetBuilder {
    return new KnowledgeDatasetBuilder();
  }

  public patterns(patterns: ReadonlyArray<LearningPattern>): this {
    this._patterns = [...patterns];
    return this;
  }

  public metadata(metadata: KnowledgeDatasetMetadata): this {
    this._metadata = metadata;
    return this;
  }

  public build(sortingField: 'patternId' | 'createdAt' = 'patternId'): KnowledgeDataset {
    if (!this._metadata) {
      throw new Error("Metadata is required to build KnowledgeDataset");
    }

    // Non-destructive sorting
    const sortedPatterns = [...this._patterns].sort((a, b) => {
      if (sortingField === 'createdAt') {
        return a.createdAt.localeCompare(b.createdAt);
      }
      return a.patternId.localeCompare(b.patternId);
    });

    // Deep freeze
    return Object.freeze({
      metadata: Object.freeze(this._metadata),
      patterns: Object.freeze(sortedPatterns.map(p => Object.freeze(p)))
    });
  }
}
