import { KnowledgeAsset } from '../contracts/KnowledgeAsset';

export interface IKnowledgeRepository {
  save(asset: KnowledgeAsset): Promise<void>;
  findById(knowledgeId: string): Promise<ReadonlyArray<KnowledgeAsset>>;
  findLatestVersion(knowledgeId: string): Promise<KnowledgeAsset | undefined>;
  findAll(): Promise<ReadonlyArray<KnowledgeAsset>>;
  count(): Promise<number>;
  
  // Inverse index lookups
  findByPatternId(patternId: string): Promise<ReadonlyArray<KnowledgeAsset>>;
  findByNodeId(nodeId: string): Promise<ReadonlyArray<KnowledgeAsset>>;
}
