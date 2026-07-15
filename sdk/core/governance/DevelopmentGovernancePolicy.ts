import { DevelopmentGovernanceInput } from './DevelopmentGovernanceInput';
import { DevelopmentGovernanceDecision } from './DevelopmentGovernanceDecision';
import { DevelopmentDecisionStatus } from './DevelopmentDecisionStatus';
import { DevelopmentAction } from './DevelopmentAction';
import { DevelopmentRecommendation } from './DevelopmentRecommendation';
import { RecommendationPriority } from './RecommendationPriority';

export class DevelopmentGovernancePolicy {
  public evaluate(input: DevelopmentGovernanceInput): DevelopmentGovernanceDecision {
    const { validationResult, reviewResults } = input;

    // 1. Calculate base metrics from Validation
    const failCount = validationResult ? validationResult.failedStages.length : 0;
    
    // Aggregate warnings and violations across stages
    let warnings = 0;
    let violations = 0;
    if (validationResult) {
      for (const res of validationResult.stageResults) {
        warnings += res.warnings.length;
        violations += res.violations.length;
      }
    }

    // 2. Consensus on Reviewer Confidence
    let maxConfidence = 0.0;
    let confidenceSource = 'None';
    let allRecommendations: DevelopmentRecommendation[] = [];

    if (reviewResults && reviewResults.length > 0) {
      if (reviewResults.length === 1) {
        maxConfidence = reviewResults[0].confidence;
        confidenceSource = String(reviewResults[0].reviewerId);
      } else {
        // Find the reviewer with the highest confidence
        const bestReview = reviewResults.reduce((prev, current) => {
          return (current.confidence > prev.confidence) ? current : prev;
        });
        maxConfidence = bestReview.confidence;
        confidenceSource = `Consensus(${bestReview.reviewerId})`;
      }

      // Aggregate recommendations
      reviewResults.forEach((r, i) => {
        r.recommendations.forEach((recText, j) => {
          allRecommendations.push({
            id: `rec-${Date.now()}-${i}-${j}`,
            title: `Reviewer Recommendation`,
            description: recText,
            priority: RecommendationPriority.MEDIUM, // Default
            generatedAt: new Date().toISOString()
          });
        });
      });
    }

    // 3. Determine Status and Action based on Policy Rules
    let status = DevelopmentDecisionStatus.UNKNOWN;
    let action = DevelopmentAction.RETRY;
    let reason = 'Unable to evaluate state';

    if (failCount > 0 || violations > 0) {
      status = DevelopmentDecisionStatus.FAILED;
      action = DevelopmentAction.BLOCK;
      reason = `Validation failed with ${failCount} failed stages and ${violations} violations.`;
    } else if (maxConfidence < 0.40 && reviewResults.length > 0) {
      // Confidence is too low, escalate to Human
      status = DevelopmentDecisionStatus.UNKNOWN;
      action = DevelopmentAction.ESCALATE;
      reason = `AI Confidence (${maxConfidence}) is below threshold (0.40). Human escalation required.`;
    } else if (warnings > 5) {
      status = DevelopmentDecisionStatus.WARNING;
      action = DevelopmentAction.REVIEW_REQUIRED;
      reason = `Too many warnings (${warnings}). Manual review is strongly recommended.`;
    } else if (reviewResults.length === 0 && !validationResult) {
      // No input provided
      status = DevelopmentDecisionStatus.UNKNOWN;
      action = DevelopmentAction.RETRY;
      reason = 'No validation or review input provided.';
    } else {
      // All clear
      status = DevelopmentDecisionStatus.PASS;
      action = DevelopmentAction.PROCEED;
      reason = 'All checks passed. Ready to proceed.';
    }

    // Optional override for Case 7 (Only recommendations, no violations)
    if (failCount === 0 && violations === 0 && warnings <= 5 && maxConfidence >= 0.40 && allRecommendations.length > 0) {
      status = DevelopmentDecisionStatus.PASS;
      action = DevelopmentAction.PROCEED;
      reason = 'Passed with recommendations.';
    }

    // 4. Calculate rough Score based on status and confidence
    let score = 0;
    if (status === DevelopmentDecisionStatus.PASS) score = 100;
    else if (status === DevelopmentDecisionStatus.WARNING) score = 70;
    else if (status === DevelopmentDecisionStatus.FAILED) score = 0;
    else score = 50;

    // Apply confidence penalty if applicable
    score = Math.floor(score * (maxConfidence || 1.0));

    return Object.freeze({
      decisionId: `DEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      decisionVersion: 'v1',
      status,
      score,
      confidence: maxConfidence,
      confidenceSource,
      action,
      recommendations: Object.freeze(allRecommendations),
      reason,
      generatedAt: new Date().toISOString()
    });
  }
}
