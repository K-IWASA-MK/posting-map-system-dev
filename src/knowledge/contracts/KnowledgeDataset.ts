import { LearningPattern } from '../../learning/contracts';

export interface KnowledgeDatasetMetadata {
  readonly datasetId: string;
  readonly recordCount: number;
  readonly sourceCount: number;
  readonly generatedAt: string; // ISO8601
  readonly schemaVersion: string;
}

export interface KnowledgeDataset {
  readonly metadata: KnowledgeDatasetMetadata;
  readonly patterns: ReadonlyArray<LearningPattern>;
}
