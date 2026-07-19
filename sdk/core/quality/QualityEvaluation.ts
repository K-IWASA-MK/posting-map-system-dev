export interface QualityScore {
  readonly overall: number;
  readonly health: number;
  readonly stability: number;
  readonly performance: number;
  readonly security: number;
  readonly compliance: number;
}

export interface Recommendation {
  readonly recommendationId: string;
  readonly qualityEvaluationId: string;
  readonly suggestedAction: string; // e.g., 'Validation', 'Cache Cleanup', 'Runtime Restart'
  readonly reason: string;
  readonly priority: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly timestamp: string;
}

export interface QualityEvaluation {
  readonly qualityEvaluationId: string;
  readonly timestamp: string;
  readonly scores: QualityScore;
  readonly policyPassed: boolean;
  readonly recommendations: Recommendation[];
}
