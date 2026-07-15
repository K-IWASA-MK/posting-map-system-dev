import { KnowledgeAsset } from '../contracts';
import { GovernanceDecision } from './GovernanceDecision';

export interface KnowledgeGovernanceResult {
  readonly approvedAssets: ReadonlyArray<KnowledgeAsset>;
  readonly rejectedAssets: ReadonlyArray<KnowledgeAsset>;
  readonly decisions: ReadonlyArray<GovernanceDecision>;
  readonly approvedCount: number;
  readonly rejectedCount: number;
  readonly durationMs: number;
}
