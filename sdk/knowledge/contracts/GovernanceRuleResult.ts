export interface GovernanceRuleResult {
  readonly ruleId: string;
  readonly passed: boolean;
  readonly reason: string;
}
