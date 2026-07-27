/**
 * GovernanceImprovementTypes.ts
 * 
 * Deployment Target Verification Gate - Self Improving Intelligence Layer (Sprint DTVG-14)
 * デプロイ判断品質の自己評価、Confidence の自動最適化、改善提案、学習サイクルの型定義。
 */

export interface DecisionQualityScore {
  totalEvaluations: number;
  correctDecisions: number;
  accuracyRate: number; // 0 - 100%
  falsePositiveRate: number;
  falseNegativeRate: number;
  qualityGrade: 'A' | 'B' | 'C' | 'D';
}

export interface ConfidenceOptimization {
  employeeId: string;
  originalConfidence: number;
  optimizedConfidence: number;
  adjustmentDelta: number;
  reason: string;
}

export interface GovernanceImprovementProposal {
  proposalId: string;
  employeeId: string;
  title: string;
  targetArea: string;
  proposedAdjustment: string;
  expectedImpact: string;
  applied: boolean;
  createdAt: string;
}

export interface LearningCycleResult {
  cycleId: string;
  employeeId: string;
  qualityScore: DecisionQualityScore;
  confidenceOptimization: ConfidenceOptimization;
  proposals: GovernanceImprovementProposal[];
  cycleCompletedAt: string;
}
