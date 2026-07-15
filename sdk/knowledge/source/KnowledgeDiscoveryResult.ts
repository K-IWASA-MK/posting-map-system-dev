import { KnowledgeDataset } from '../contracts/KnowledgeDataset';

export interface KnowledgeDiscoveryResult {
  readonly requestId: string;
  readonly datasetId: string;
  readonly dataset: KnowledgeDataset;
  readonly patternCount: number;
  readonly durationMs: number;
  readonly sourceCount: number;
  readonly resolvedAt: string; // ISO 8601
}
