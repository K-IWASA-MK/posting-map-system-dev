/**
 * DeploymentImprovementTypes.ts
 * 
 * Deployment Target Verification Gate - Autonomous Deployment Improvement Engine (Sprint DTVG-10)
 * 過去ナレッジ・リスク予測に基づき、AI Employee 向け自律改善提案および予防策を構造化する型定義。
 */

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ImprovementConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PreventiveAction {
  actionId: string;
  title: string;
  description: string;
  targetGate: string;
  requiresApproval: boolean;
}

export interface RiskPrediction {
  riskId: string;
  riskLevel: RiskLevel;
  predictedFailures: string[];
  score: number; // 0 - 100
  reason: string;
}

export interface ImprovementSuggestion {
  suggestionId: string;
  title: string;
  category: string;
  preventiveActions: PreventiveAction[];
  confidence: ImprovementConfidence;
  expectedImpact: string;
}

export interface DeploymentRecommendation {
  recommendationId: string;
  releaseId: string;
  employeeId: string;
  riskPrediction: RiskPrediction;
  suggestions: ImprovementSuggestion[];
  aiPromptContext: string;
  generatedAt: string;
}
