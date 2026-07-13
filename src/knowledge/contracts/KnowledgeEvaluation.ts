import { GovernanceRuleResult } from './GovernanceRuleResult';

export interface KnowledgeEvaluation {
  readonly confidence: number;
  readonly quality: number;
  readonly trustLevel: string;
  readonly ruleResults: ReadonlyArray<GovernanceRuleResult>;
  readonly policyVersion?: string;
}
