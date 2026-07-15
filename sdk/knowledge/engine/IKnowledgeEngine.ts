import { KnowledgeDataset } from '../contracts/KnowledgeDataset';
import { KnowledgeAsset } from '../contracts/KnowledgeAsset';

export interface IKnowledgeEngine {
  synthesize(dataset: KnowledgeDataset): Promise<ReadonlyArray<KnowledgeAsset>>;
}
