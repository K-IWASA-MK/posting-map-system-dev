import { KnowledgeAsset, GovernanceRuleResult } from '../contracts';

export interface IGovernanceRule {
  readonly ruleId: string;
  evaluate(asset: KnowledgeAsset): GovernanceRuleResult;
}
