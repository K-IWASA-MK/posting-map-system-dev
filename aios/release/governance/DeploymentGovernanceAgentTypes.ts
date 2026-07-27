/**
 * DeploymentGovernanceAgentTypes.ts
 * 
 * Deployment Target Verification Gate - Governance Agent Layer (Sprint DTVG-12)
 * AI Employee 内部で動く Deployment Governance Agent の状態・リクエスト・結果型定義。
 */

import { DeploymentGateRequest, GateResult } from '../gates/types/DeploymentTargetGateTypes';
import { ApprovalDecision, DecisionReport } from '../approval/DeploymentApprovalTypes';
import { DeploymentRecommendation, RiskLevel } from '../improvement/DeploymentImprovementTypes';

export type GovernanceAgentStatus =
  | 'INITIALIZING'
  | 'ANALYZING'
  | 'VERIFYING'
  | 'EVALUATING'
  | 'REPORTING'
  | 'COMPLETED'
  | 'FAILED';

export interface GovernanceStageResult {
  stage: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'SKIPPED';
  detail: string;
  durationMs: number;
}

export interface DeploymentGovernanceRequest {
  gateRequest: DeploymentGateRequest;
  runDryRun?: boolean;
  runSmokeTest?: boolean;
}

export interface GovernanceReport {
  reportId: string;
  releaseId: string;
  employeeId: string;
  overallDecision: ApprovalDecision;
  confidence: number;
  riskLevel: RiskLevel;
  gateSummary: {
    totalGates: number;
    passedGates: number;
    failedGates: number;
  };
  stageResults: GovernanceStageResult[];
  decisionReport: DecisionReport;
  recommendation: DeploymentRecommendation;
  reportMarkdown: string;
  generatedAt: string;
}

export interface GovernanceExecutionResult {
  agentStatus: GovernanceAgentStatus;
  report: GovernanceReport;
  executionLedgerId?: string;
}
