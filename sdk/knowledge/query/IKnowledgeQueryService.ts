import { KnowledgeAsset } from '../contracts/KnowledgeAsset';
import { KnowledgeQueryRequest } from './KnowledgeQueryRequest';
import { KnowledgeQueryResult } from './KnowledgeQueryResult';

export interface IKnowledgeQueryService {
  query(request: KnowledgeQueryRequest): Promise<KnowledgeQueryResult>;
  findById(knowledgeId: string): Promise<ReadonlyArray<KnowledgeAsset>>;
  findLatestVersion(knowledgeId: string): Promise<KnowledgeAsset | undefined>;
  findByPatternId(patternId: string): Promise<ReadonlyArray<KnowledgeAsset>>;
  findByNodeId(nodeId: string): Promise<ReadonlyArray<KnowledgeAsset>>;
  findAll(): Promise<ReadonlyArray<KnowledgeAsset>>;
  count(): Promise<number>;

  // Future extension placeholders
  findByEdgeType(edgeType: string): Promise<ReadonlyArray<KnowledgeAsset>>;
  findByRuleType(ruleType: string): Promise<ReadonlyArray<KnowledgeAsset>>;
}
