import { LearningPattern } from '../contracts';

export interface PatternQueryResult {
  readonly requestId: string;
  readonly resultId: string;
  readonly schemaVersion: string;
  readonly generatedAt: string; // ISO8601
  
  readonly patterns: ReadonlyArray<LearningPattern>;
  
  readonly totalCount: number;
  readonly returnedCount: number;
  
  // Pagination helpers
  readonly hasNextPage: boolean;
  readonly nextOffset?: number;
}
