import { PerformanceValidationSummary } from '../validation/PerformanceValidationSummary';
import { 
  PerformanceGovernanceStatus, 
  PerformanceGovernanceAction, 
  PerformanceGovernanceDecision 
} from './PerformanceGovernanceDecision';

export class PerformanceGovernancePolicy {
  public static readonly PASS_SCORE = 90;
  public static readonly WARNING_SCORE = 70;
  public static readonly MAX_WARNING = 3;

  public evaluate(summary: PerformanceValidationSummary): PerformanceGovernanceDecision {
    let status: PerformanceGovernanceStatus;
    let action: PerformanceGovernanceAction;
    let recommendation: string;

    const { failed, warning, score } = summary;

    // FAILED: Any failures, or score below WARNING_SCORE
    if (failed > 0 || score < PerformanceGovernancePolicy.WARNING_SCORE) {
      status = 'FAILED';
      action = PerformanceGovernanceAction.BLOCK;
      recommendation = 'Performance violations must be resolved before release.';
    } 
    // WARNING: No failures, but too many warnings or score is between WARNING_SCORE and PASS_SCORE
    else if (warning > PerformanceGovernancePolicy.MAX_WARNING || score < PerformanceGovernancePolicy.PASS_SCORE) {
      status = 'WARNING';
      action = PerformanceGovernanceAction.REVIEW_REQUIRED;
      recommendation = 'Performance improvements recommended.';
    } 
    // PASS: No failures, warnings within limit, and score >= PASS_SCORE
    else {
      status = 'PASS';
      action = PerformanceGovernanceAction.PROCEED;
      recommendation = 'No action required.';
    }

    return {
      status,
      score,
      action,
      recommendation,
      generatedAt: new Date().toISOString()
    };
  }
}
