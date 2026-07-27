/**
 * GovernanceConfidenceOptimizer.ts
 * 
 * Deployment Target Verification Gate - Confidence Optimizer (Sprint DTVG-14)
 * 過去の判断精度 (Decision Quality) および実デプロイ成功実績に基づいて
 * AI Employee の判定 Confidence の安全な微補正計算 (Confidence Optimization) を行う。
 */

import { ConfidenceOptimization, DecisionQualityScore } from './GovernanceImprovementTypes';

export class GovernanceConfidenceOptimizer {
  /**
   * 判断品質スコアおよび元 Confidence から最適化 Confidence を算出する
   */
  public optimizeConfidence(
    employeeId: string,
    originalConfidence: number,
    quality: DecisionQualityScore
  ): ConfidenceOptimization {
    let adjustmentDelta = 0;
    let reason = 'Baseline confidence maintained.';

    if (quality.totalEvaluations >= 15 && quality.accuracyRate >= 95) {
      adjustmentDelta = 3.0;
      reason = `High accuracy rate (${quality.accuracyRate.toFixed(1)}%) over ${quality.totalEvaluations} deployments. Increased confidence by +3.0%.`;
    } else if (quality.totalEvaluations >= 5 && quality.accuracyRate >= 90) {
      adjustmentDelta = 1.5;
      reason = `Good accuracy rate (${quality.accuracyRate.toFixed(1)}%). Increased confidence by +1.5%.`;
    } else if (quality.falsePositiveRate > 15) {
      adjustmentDelta = -4.0;
      reason = `High false positive rate (${quality.falsePositiveRate.toFixed(1)}%). Reduced confidence by -4.0% for safety.`;
    } else if (quality.accuracyRate < 80 && quality.totalEvaluations >= 3) {
      adjustmentDelta = -5.0;
      reason = `Sub-optimal decision accuracy (${quality.accuracyRate.toFixed(1)}%). Reduced confidence by -5.0%.`;
    }

    const rawOptimized = originalConfidence + adjustmentDelta;
    const optimizedConfidence = Math.min(99, Math.max(50, rawOptimized));

    return {
      employeeId,
      originalConfidence,
      optimizedConfidence,
      adjustmentDelta,
      reason
    };
  }
}
