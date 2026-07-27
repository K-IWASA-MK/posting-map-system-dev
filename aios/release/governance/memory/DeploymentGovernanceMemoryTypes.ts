/**
 * DeploymentGovernanceMemoryTypes.ts
 * 
 * Deployment Target Verification Gate - Governance Memory & Evolution Layer (Sprint DTVG-13)
 * デプロイガバナンス判断履歴の長期記憶、経験分析、および能力進化スナップショットの型定義。
 */

import { ApprovalDecision } from '../../approval/DeploymentApprovalTypes';
import { RiskLevel } from '../../improvement/DeploymentImprovementTypes';

export interface GovernanceMemoryRecord {
  memoryId: string;
  releaseId: string;
  employeeId: string;
  decision: ApprovalDecision;
  confidence: number;
  riskLevel: RiskLevel;
  gatePassedCount: number;
  gateFailedCount: number;
  humanReviewResult?: 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
  finalOutcome: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  recordedAt: string;
}

export interface GovernancePattern {
  patternId: string;
  patternName: string;
  category: string;
  frequency: number;
  impactScore: number;
  preventionStrategy: string;
}

export interface GovernanceExperience {
  employeeId: string;
  totalMemories: number;
  successfulOutcomeRate: number;
  falsePositiveRate: number;
  learnedPatterns: GovernancePattern[];
}

export interface EvolutionSnapshot {
  snapshotId: string;
  employeeId: string;
  governanceSkillLevel: 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
  confidenceAdjustment: number;
  evolutionInsights: string[];
  createdAt: string;
}

export interface MemoryQuery {
  employeeId?: string;
  decision?: ApprovalDecision;
  finalOutcome?: string;
  limit?: number;
}
