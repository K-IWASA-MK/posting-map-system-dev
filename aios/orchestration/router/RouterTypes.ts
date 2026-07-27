import { TaskRiskLevel } from '../executive/ExecutiveTypes';

export interface AgentSelectionScore {
  readonly employeeId: string;
  readonly capabilityMatchScore: number;       // Normalized 0.0 - 1.0
  readonly governanceTrustScore: number;        // Normalized 0.0 - 1.0
  readonly domainExperienceScore: number;       // Normalized 0.0 - 1.0
  readonly historicalTaskSimilarityScore: number;// Normalized 0.0 - 1.0 (Task Similarity)
  readonly learningValueScore: number;          // Normalized 0.0 - 1.0 (Growth potential)
  readonly workloadBalanceScore: number;        // Normalized 0.0 - 1.0 (1.0 = Fully Available)
  readonly overallScore: number;               // Weighted composite 0.0 - 1.0
}

export interface CandidateRejectionReason {
  readonly employeeId: string;
  readonly reason: string;
  readonly score: number;
}

export interface AssignmentDecisionRecord {
  readonly decisionId: string;
  readonly taskId: string;
  readonly selectedEmployeeId: string;
  readonly selectedScore: number;
  readonly rejectedCandidates: readonly CandidateRejectionReason[];
  readonly appliedPolicy: string; // e.g. "HIGH_RISK_TRUST_FIRST" | "LOW_RISK_GROWTH_TIE_BREAKER"
  readonly timestamp: number;
}
