import { PatternType } from '../contracts';

export interface PatternQueryRequest {
  readonly queryId: string;
  readonly correlationId?: string; // Links query to UI action or Audit log
  readonly schemaVersion: string;
  
  readonly patternId?: string;
  readonly patternType?: PatternType;
  readonly version?: number;
  readonly trustLevel?: string;
  readonly createdAfter?: string; // ISO8601
  readonly createdBefore?: string; // ISO8601
  readonly sourceDatasetId?: string;
  
  readonly limit?: number;
  readonly offset?: number;
}
