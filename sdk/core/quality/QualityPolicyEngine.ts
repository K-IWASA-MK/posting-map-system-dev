import { QualityEvaluation, QualityScore, Recommendation } from './QualityEvaluation';

export class QualityPolicyEngine {
  public evaluate(
    projection: any,
    config: { minPassingOverallScore: number; minPassingHealthScore: number; minPassingStabilityScore: number },
    complianceScore = 100
  ): QualityEvaluation {
    const evalId = `EVAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();

    // 1. Calculate Scores based on projection
    const scores = this.calculateScores(projection, complianceScore);

    // 2. Policy Evaluation
    const policyPassed = 
      scores.overall >= config.minPassingOverallScore &&
      scores.health >= config.minPassingHealthScore &&
      scores.stability >= config.minPassingStabilityScore;

    // 3. Generate Recommendations
    const recommendations = this.generateRecommendations(evalId, scores, projection);

    return {
      qualityEvaluationId: evalId,
      timestamp,
      scores,
      policyPassed,
      recommendations
    };
  }

  private calculateScores(projection: any, complianceScore = 100): QualityScore {
    if (!projection || !projection.platformHealth) {
      return { overall: Math.round((50 + 50 + 50 + complianceScore) / 4), health: 50, stability: 50, performance: 100, security: 100, compliance: complianceScore };
    }

    // Health Score calculation
    let health = 100;
    if (projection.platformHealth === 'UNHEALTHY') health = 20;
    else if (projection.platformHealth === 'DEGRADED') health = 60;

    // Stability Score calculation (deduct based on failed traces or alerts)
    let stability = 100;
    if (projection.activeAlerts) {
      stability -= projection.activeAlerts.length * 15;
    }
    if (projection.traces) {
      const failed = projection.traces.filter((t: any) => t.status === 'failed').length;
      stability -= failed * 20;
    }
    stability = Math.max(0, Math.min(100, stability));

    // Performance Score calculation (deduct on trace duration)
    let performance = 100;
    if (projection.traces && projection.traces.length > 0) {
      const slow = projection.traces.filter((t: any) => t.duration > 500).length;
      performance -= slow * 10;
    }
    performance = Math.max(0, Math.min(100, performance));

    // Mapped Overall score
    const overall = Math.round((health + stability + performance + complianceScore) / 4);

    return {
      overall,
      health,
      stability,
      performance,
      security: 100, // Placeholder for Phase 7
      compliance: complianceScore // Placeholder for Phase 7
    };
  }

  private generateRecommendations(evalId: string, scores: QualityScore, projection: any): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (scores.health < 80) {
      recommendations.push({
        recommendationId: `REC-${Date.now()}-H`,
        qualityEvaluationId: evalId,
        suggestedAction: 'Diagnostic Report',
        reason: `Health score is critically low (${scores.health}%). Mapped PlatformState: ${projection.platformHealth}`,
        priority: 'HIGH',
        timestamp: new Date().toISOString()
      });
    }

    if (scores.stability < 90) {
      // Suggest Validation or Cache Cleanup if alerts/failures occur
      const hasValidationFailures = projection.activeAlerts?.some((a: any) => a.ruleId.includes('VAL') || a.message.includes('Validation'));
      recommendations.push({
        recommendationId: `REC-${Date.now()}-S`,
        qualityEvaluationId: evalId,
        suggestedAction: hasValidationFailures ? 'Validation' : 'Cache Cleanup',
        reason: `Stability score degraded to ${scores.stability}% due to traces/alerts activity.`,
        priority: 'HIGH',
        timestamp: new Date().toISOString()
      });
    }

    return recommendations;
  }
}
