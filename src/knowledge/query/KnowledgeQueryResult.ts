import { KnowledgeAsset } from '../contracts/KnowledgeAsset';

export interface KnowledgeQueryResult {
  readonly requestId: string;
  readonly resultId: string;
  readonly schemaVersion: string;
  
  // Runtime Metadata (Not part of Knowledge Asset)
  readonly generatedAt: string;
  readonly durationMs: number;
  
  readonly assets: ReadonlyArray<KnowledgeAsset>;
  readonly totalCount: number;
  readonly returnedCount: number;
  readonly hasNextPage: boolean;
  readonly nextOffset?: number;
}
