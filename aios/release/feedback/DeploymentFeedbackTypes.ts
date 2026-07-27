/**
 * DeploymentFeedbackTypes.ts
 * 
 * Deployment Target Verification Gate - AI Employee Feedback Loop Layer (Sprint DTVG-09)
 * ExecutionLedger のガバナンス記録から失敗パターン・改善改善策を抽出し、
 * AI Employee の次回デプロイ学習用ナレッジとして構造化する型定義。
 */

export type FailureCategory =
  | 'REPOSITORY_MISMATCH'
  | 'BRANCH_MISMATCH'
  | 'PUBLISH_ROOT_MISMATCH'
  | 'RUNTIME_CONFIG_MISMATCH'
  | 'EMPLOYEE_AUTHORIZATION_VIOLATION'
  | 'FINGERPRINT_MISMATCH'
  | 'POST_DEPLOYMENT_SMOKE_FAIL'
  | 'UNKNOWN_FAILURE';

export interface FailurePattern {
  patternId: string;
  category: FailureCategory;
  name: string;
  cause: string;
  prevention: string;
  targetGate: string;
}

export interface ImprovementRecommendation {
  recommendationId: string;
  employeeId: string;
  releaseId: string;
  category: FailureCategory;
  summary: string;
  actionableAdvice: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DeploymentLearningRecord {
  recordId: string;
  employeeId: string;
  releaseId: string;
  overallStatus: string;
  extractedPatterns: FailurePattern[];
  recommendations: ImprovementRecommendation[];
  learnedAt: string;
}

export interface DeploymentFeedback {
  employeeId: string;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  successRate: number;
  recentLearningRecords: DeploymentLearningRecord[];
  topFailurePatterns: { pattern: FailurePattern; occurrences: number }[];
}
