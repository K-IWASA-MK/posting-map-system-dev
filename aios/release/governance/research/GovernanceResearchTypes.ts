/**
 * GovernanceResearchTypes.ts
 * 
 * Deployment Target Verification Gate - Autonomous Research Layer (Sprint DTVG-15)
 * 未知障害パターン探索、リスク仮説生成、仮説検証、およびナレッジ拡張提案の型定義。
 */

export interface PatternDiscovery {
  discoveryId: string;
  category: string;
  correlatedFactors: string[];
  frequency: number;
  confidenceScore: number; // 0 - 100%
}

export interface RiskHypothesis {
  hypothesisId: string;
  title: string;
  statement: string;
  targetGate: string;
  suspectedCause: string;
  suggestedCheck: string;
  probability: number; // 0 - 100%
}

export interface ResearchValidationResult {
  validationId: string;
  hypothesisId: string;
  historicalMatchRate: number;
  sampleSize: number;
  validated: boolean;
  falsePositiveRatio: number;
}

export interface KnowledgeExpansionProposal {
  proposalId: string;
  hypothesisId: string;
  proposedPatternName: string;
  preventionGuidance: string;
  expectedRiskReduction: string;
  createdAt: string;
}

export interface ResearchFinding {
  findingId: string;
  employeeId: string;
  discoveries: PatternDiscovery[];
  hypotheses: RiskHypothesis[];
  validations: ResearchValidationResult[];
  proposals: KnowledgeExpansionProposal[];
  researchedAt: string;
}
