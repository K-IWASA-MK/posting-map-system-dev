import { DevelopmentGovernanceDecision } from './DevelopmentGovernanceDecision';

export interface DevelopmentGovernanceResult {
  readonly decision: DevelopmentGovernanceDecision;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly inputSummary: {
    readonly validationEvaluated: boolean;
    readonly totalReviewers: number;
    readonly totalCosts: number;
  };
}
