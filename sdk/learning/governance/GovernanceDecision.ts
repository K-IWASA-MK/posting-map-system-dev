import { RuleResult } from './RuleResult';

export interface GovernanceDecision {
  readonly decisionId: string;
  readonly approved: boolean;
  readonly reason: string;
  readonly policyId: string;
  readonly ruleResults: ReadonlyArray<RuleResult>;
}
