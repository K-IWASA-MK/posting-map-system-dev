export interface KnowledgeQueryRequest {
  readonly queryId: string;
  readonly correlationId?: string;
  readonly schemaVersion: string;
  
  readonly knowledgeId?: string;
  readonly version?: number;
  
  // Graph & Index filters
  readonly nodeId?: string;
  readonly patternId?: string;
  readonly edgeType?: string; // Future extension
  readonly ruleType?: string; // Future extension
  
  readonly limit?: number;
  readonly offset?: number;
}
