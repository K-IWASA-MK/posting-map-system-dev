import { KnowledgeAsset } from '../contracts';
import { KnowledgeGovernanceResult } from './KnowledgeGovernanceResult';

export interface IKnowledgeGovernanceOrchestrator {
  evaluateAndStore(draftAssets: ReadonlyArray<KnowledgeAsset>): Promise<KnowledgeGovernanceResult>;
}
