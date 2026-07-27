/**
 * GovernanceMetaTypes.ts
 * 
 * Deployment Target Verification Gate - Meta Intelligence Layer (Sprint DTVG-16)
 * ガバナンス健全性スコア、成熟度レベル、進化指標、および メタ統合レポートの型定義。
 */

export interface GovernanceHealthScore {
  gateSuccessRate: number;
  smokeStabilityRate: number;
  decisionAccuracyRate: number;
  falsePositiveRate: number;
  learningEffectiveness: number;
  overallScore: number; // 0 - 100
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION';
}

export type MaturityLevelId =
  | 'LEVEL_1_FOUNDATION'
  | 'LEVEL_2_CONTROLLED'
  | 'LEVEL_3_LEARNING'
  | 'LEVEL_4_ADAPTIVE'
  | 'LEVEL_5_AUTONOMOUS';

export interface GovernanceMaturityLevel {
  level: MaturityLevelId;
  levelName: string;
  description: string;
  unlockedCapabilities: string[];
}

export interface EvolutionMetrics {
  confidenceTrend: number;
  skillLevel: string;
  researchFindingCount: number;
  improvementProposalCount: number;
  stabilityScore: number;
}

export interface MetaAssessmentResult {
  assessmentId: string;
  employeeId: string;
  healthScore: GovernanceHealthScore;
  maturityLevel: GovernanceMaturityLevel;
  evolutionMetrics: EvolutionMetrics;
  metaReportMarkdown: string;
  assessedAt: string;
}
