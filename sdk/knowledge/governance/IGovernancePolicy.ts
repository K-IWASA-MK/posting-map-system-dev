import { KnowledgeAsset, KnowledgeEvaluation } from '../contracts';
import { GovernanceDecision } from './GovernanceDecision';

export interface PolicyEvaluationResult {
  readonly decision: GovernanceDecision;
  readonly evaluation?: KnowledgeEvaluation;
}

export interface IGovernancePolicy {
  readonly policyId: string;
  readonly targetPluginId: string;
  evaluate(asset: KnowledgeAsset): PolicyEvaluationResult;
}
