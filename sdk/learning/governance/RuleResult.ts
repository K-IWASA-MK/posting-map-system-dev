export interface RuleResult {
  readonly ruleId: string;
  readonly passed: boolean;
  readonly reason?: string;
  readonly metadata?: Record<string, any>;
}
