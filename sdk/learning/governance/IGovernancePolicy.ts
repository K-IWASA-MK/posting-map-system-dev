import { LearningPattern, PatternEvaluation, PatternType } from '../contracts';
import { GovernanceDecision } from './GovernanceDecision';

export interface PolicyEvaluationResult {
  readonly decision: GovernanceDecision;
  readonly evaluation?: PatternEvaluation;
}

export interface IGovernancePolicy {
  readonly policyId: string;
  readonly targetPatternType: PatternType;
  evaluate(pattern: LearningPattern): PolicyEvaluationResult;
}
